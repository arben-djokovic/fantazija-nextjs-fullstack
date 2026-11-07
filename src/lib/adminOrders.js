import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { pickupTimes, todayInPodgorica } from "@/lib/date";
import { buildCatalogItem, isRealDate, parseQuantity, text } from "@/lib/orders";
import { describeItem } from "@/lib/orderLines";
import { FLAVOUR_ITEM_SLUGS, customCakeOptionKey, needsPhonePricing } from "@/data/cakeBuilder";
import { OPTION_KEYS } from "@/data/items";
import { ORDER_STATUSES, STATUS_TRANSITIONS } from "@/data/orders";
import Item from "@/models/Item";
import Order from "@/models/Order";

const MAX_RESULTS = 200;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class OrderAdminError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Tabovi na admin stranici: "new" su sve nove narudžbe (bez datuma), ostali su za izabrani dan.
// "all" ne uključuje otkazane, da zbir za dan bude tačan; otkazane imaju svoj tab.
export const ORDER_TABS = ["all", "confirmed", "ready", "completed", "cancelled", "new"];
const DAY_STATUSES = ["new", "confirmed", "ready", "completed"];

export function tabFilters(tab, date) {
  if (tab === "new") return { status: ["new"] };
  if (tab === "all") return { date, status: DAY_STATUSES };
  return { date, status: [tab] };
}

// Broj narudžbi po tabu za dati dan, za brojeve na tabovima. "new" se broji za sve dane.
export async function countOrdersByTab(date) {
  await connectDB();
  const [byStatus, newCount] = await Promise.all([
    Order.aggregate([{ $match: { pickupDate: date } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.countDocuments({ status: "new" }),
  ]);
  const counts = Object.fromEntries(byStatus.map((entry) => [entry._id, entry.count]));
  return {
    new: newCount,
    confirmed: counts.confirmed ?? 0,
    ready: counts.ready ?? 0,
    completed: counts.completed ?? 0,
    cancelled: counts.cancelled ?? 0,
    all: DAY_STATUSES.reduce((sum, status) => sum + (counts[status] ?? 0), 0),
  };
}

// Zbir proizvoda iz narudžbi: stavke iz ponude se sabiraju po proizvodu i opciji,
// a torte po želji se nabrajaju pojedinačno, jer je svaka drugačija.
// Proizvodi iz ponude koji su ista torta kao neki ukus iz buildera: ID proizvoda -> ukus.
export async function getFlavourItemIds() {
  await connectDB();
  const slugs = Object.values(FLAVOUR_ITEM_SLUGS);
  const items = await Item.find({ slug: { $in: slugs } }).select("slug").lean();
  const flavourBySlug = Object.fromEntries(Object.entries(FLAVOUR_ITEM_SLUGS).map(([flavour, slug]) => [slug, flavour]));
  return new Map(items.map((item) => [item._id.toString(), flavourBySlug[item.slug]]));
}

// Zbir: koliko čega treba. Torta po želji se broji zajedno sa istom tortom iz ponude (isti ukus i veličina),
// a posebno se pamti koliko je od toga po želji. Specijalne torte imaju svoj red.
// Sve torte po želji se uz to navode i pojedinačno, sa natpisom, željama i ostalim detaljima.
export function summarizeOrders(orders, flavourByItemId = new Map()) {
  const products = new Map();
  const customCakes = [];

  const add = (key, title, option, quantity, custom) => {
    const entry = products.get(key) ?? { title, option, quantity: 0, custom: 0 };
    entry.quantity += quantity;
    if (custom) entry.custom += quantity;
    // Naziv iz ponude ima prednost ("Rafaelo torta" umjesto "Rafaelo").
    else entry.title = title;
    products.set(key, entry);
  };

  for (const order of orders) {
    for (const line of order.items) {
      const { title, option, details, photos } = describeItem(line);

      // Nova torta po želji je torta iz ponude, pa se broji zajedno sa njom (isti proizvod i opcija).
      if (line.kind === "custom" && line.item) {
        const flavour = flavourByItemId.get(String(line.item));
        const key = flavour ? `flavour:${flavour}|${line.optionKey}` : `item:${line.item}|${line.optionKey}`;
        add(key, title, OPTION_KEYS[line.optionKey], line.quantity, true);
        customCakes.push({ time: order.pickupTime, date: order.pickupDate, customer: order.customer.name, quantity: line.quantity, title, option, details, photos });
        continue;
      }

      if (line.kind === "custom") {
        const cake = line.custom;
        const optionKey = customCakeOptionKey(cake);
        const key = cake.cakeType === "special" ? "special" : `flavour:${cake.flavour}|${optionKey}`;
        add(key, title, cake.cakeType === "special" ? "po dogovoru" : OPTION_KEYS[optionKey], line.quantity, true);
        customCakes.push({ time: order.pickupTime, date: order.pickupDate, customer: order.customer.name, quantity: line.quantity, title, option, details, photos });
        continue;
      }

      const flavour = flavourByItemId.get(String(line.item));
      const key = flavour ? `flavour:${flavour}|${line.optionKey}` : `item:${line.item}|${line.optionKey}`;
      add(key, title, option, line.quantity, false);
    }
  }

  return {
    products: [...products.values()].sort((a, b) => a.title.localeCompare(b.title, "sr")),
    customCakes,
  };
}

const MAX_SEARCH = 50;

// Slova koja se često kucaju bez kvačica: "durovic" nalazi "Đurović", "sasa" nalazi "Saša".
const LETTER_VARIANTS = { c: "[cčć]", s: "[sš]", z: "[zž]", d: "(?:dj|đ|d)", e: "[eë]" };

// Tekst pretrage u regex za ime ili telefon, bez razlike između velikih/malih slova i kvačica.
function searchPattern(query) {
  const normalized = query
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .slice(0, MAX_SEARCH);
  // Razmaci u telefonu se preskaču ("067111222" nalazi "067 111 222"), a vodeća nula domaćeg broja
  // se izostavlja, da se nađe i broj upisan kao "+382 67 111 222".
  const digitsOnly = normalized.replace(/\s+(?=\d)|(?<=\d)\s+/g, "");
  const pattern = [.../^0\d/.test(digitsOnly) ? digitsOnly.slice(1) : digitsOnly]
    .map((char) => {
      if (/\d/.test(char)) return `${char}\\s*`;
      return LETTER_VARIANTS[char] ?? char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("");
  return new RegExp(pattern, "i");
}

// Filteri iz URL-a: ?status=new,confirmed&date=2026-11-05&from=2026-11-01&to=2026-11-30&q=milica
export function parseOrderFilters(searchParams) {
  const filters = {};
  const status = searchParams.get("status");
  if (status) {
    filters.status = status.split(",").filter((value) => Object.hasOwn(ORDER_STATUSES, value));
    if (filters.status.length === 0) throw new OrderAdminError(400, "Nepoznat status");
  }
  const q = searchParams.get("q")?.trim();
  if (q) filters.q = q;
  for (const key of ["date", "from", "to"]) {
    const value = searchParams.get(key);
    if (value && !ISO_DATE.test(value)) throw new OrderAdminError(400, `Datum "${key}" mora biti u obliku YYYY-MM-DD`);
    if (value) filters[key] = value;
  }
  return filters;
}

// Narudžbe po datumu i terminu preuzimanja; za "nove" bez datuma prve su najstarije.
export async function listOrders({ status, date, from, to, q } = {}) {
  const query = {};
  if (q) {
    const pattern = searchPattern(q);
    query.$or = [{ "customer.name": pattern }, { "customer.phone": pattern }];
  }
  if (status?.length) query.status = { $in: status };
  if (date) query.pickupDate = date;
  else if (from || to) query.pickupDate = { ...(from && { $gte: from }), ...(to && { $lte: to }) };

  await connectDB();
  return Order.find(query).sort({ pickupDate: 1, pickupTime: 1, createdAt: 1 }).limit(MAX_RESULTS).lean();
}

export async function findOrder(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  return Order.findById(id).lean();
}

// Mijenja status samo ako je prelaz dozvoljen iz trenutnog statusa. Provjera i izmjena su jedan upit,
// pa ako dva radnika kliknu istovremeno, drugi dobija grešku umjesto da pregazi prvog.
export async function updateOrderStatus(id, status, user) {
  if (!Object.hasOwn(ORDER_STATUSES, status)) throw new OrderAdminError(400, "Nepoznat status");
  if (!mongoose.isValidObjectId(id)) throw new OrderAdminError(404, "Narudžba ne postoji");

  const allowedFrom = Object.keys(STATUS_TRANSITIONS).filter((from) => STATUS_TRANSITIONS[from].includes(status));

  await connectDB();
  const order = await Order.findOneAndUpdate(
    { _id: id, status: { $in: allowedFrom } },
    { $set: { status }, $push: { history: { action: "status", status, by: user._id, byName: user.name, at: new Date() } } },
    { returnDocument: "after" },
  ).lean();

  if (order) return order;

  const current = await Order.findById(id).select("status").lean();
  if (!current) throw new OrderAdminError(404, "Narudžba ne postoji");
  throw new OrderAdminError(
    409,
    `Narudžba je trenutno "${ORDER_STATUSES[current.status]}" i ne može preći u "${ORDER_STATUSES[status]}". Osvježite stranicu.`,
  );
}

// Narudžba se mijenja samo dok torta još nije spremna.
export const EDITABLE_STATUSES = ["new", "confirmed"];
const MAX_NOTE = 1000;

const money = (value) => (value === null ? "po dogovoru" : `${String(value).replace(".", ",")} €`);
const shortDate = (iso) => `${Number(iso.slice(8, 10))}. ${Number(iso.slice(5, 7))}.`;

function parsePrice(value) {
  if (value === null || value === "") return null;
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0 || price > 100000) throw new OrderAdminError(400, "Neispravna cijena");
  return Math.round(price * 100) / 100;
}

// Izmjena narudžbe (termin, kupac, stavke, cijene, napomena).
// body.items: postojeće stavke { id, quantity, unitPrice } i nove iz ponude { kind: "item", itemId, optionId, quantity }.
// Stavka koja nije poslata se briše. Cijene novih stavki uzimaju se iz baze, kao kod kupca.
export async function updateOrder(id, body, user) {
  if (!mongoose.isValidObjectId(id)) throw new OrderAdminError(404, "Narudžba ne postoji");
  await connectDB();

  const order = await Order.findById(id);
  if (!order) throw new OrderAdminError(404, "Narudžba ne postoji");
  if (!EDITABLE_STATUSES.includes(order.status)) {
    throw new OrderAdminError(409, `Narudžba je "${ORDER_STATUSES[order.status]}" i više se ne može mijenjati.`);
  }
  // Ako je neko drugi u međuvremenu sačuvao izmjenu, ova forma ima stare podatke.
  if (body?.updatedAt && new Date(body.updatedAt).getTime() !== order.updatedAt.getTime()) {
    throw new OrderAdminError(409, "Neko je u međuvremenu izmijenio ovu narudžbu. Osvježite stranicu.");
  }

  const changes = [];

  const name = text(body?.customer?.name);
  const phone = text(body?.customer?.phone);
  if (!name || !phone) throw new OrderAdminError(400, "Ime i telefon su obavezni");
  const viber = body?.customer?.viber === true;
  if (name !== order.customer.name || phone !== order.customer.phone || viber !== order.customer.viber) changes.push("kupac");
  order.customer = { name, phone, viber };

  const pickupDate = text(body?.pickupDate);
  const pickupTime = text(body?.pickupTime);
  if (!isRealDate(pickupDate)) throw new OrderAdminError(400, "Neispravan datum");
  if (!pickupTimes.includes(pickupTime)) throw new OrderAdminError(400, "Nepoznat termin preuzimanja");
  if (pickupDate !== order.pickupDate && pickupDate < todayInPodgorica()) {
    throw new OrderAdminError(400, "Datum preuzimanja ne može biti u prošlosti");
  }
  if (pickupDate !== order.pickupDate || pickupTime !== order.pickupTime) {
    changes.push(`termin ${shortDate(order.pickupDate)} ${order.pickupTime} → ${shortDate(pickupDate)} ${pickupTime}`);
  }
  order.pickupDate = pickupDate;
  order.pickupTime = pickupTime;

  const note = text(body?.note).slice(0, MAX_NOTE);
  if (note !== (order.note ?? "")) changes.push("napomena");
  order.note = note || undefined;

  const rawItems = Array.isArray(body?.items) ? body.items : [];
  if (rawItems.length === 0) throw new OrderAdminError(400, "Narudžba mora imati bar jednu stavku");

  const newIds = rawItems.filter((raw) => !raw?.id && mongoose.isValidObjectId(raw?.itemId)).map((raw) => raw.itemId);
  const catalog = await Item.find({ _id: { $in: newIds }, active: true }).lean();
  const itemsById = new Map(catalog.map((item) => [item._id.toString(), item]));

  const keptIds = new Set();
  const lines = rawItems.map((raw) => {
    let quantity;
    try {
      quantity = parseQuantity(raw?.quantity);
    } catch {
      throw new OrderAdminError(400, "Neispravna količina");
    }

    if (!raw?.id) {
      let built;
      try {
        built = buildCatalogItem({ ...raw, quantity }, itemsById);
      } catch {
        throw new OrderAdminError(400, "Proizvod ili opcija više nije dostupna");
      }
      const { phonePrice, ...line } = built;
      changes.push(`dodato ${quantity}× ${line.name.me}`);
      return line;
    }

    const existing = order.items.find((entry) => entry._id.toString() === raw.id);
    if (!existing) throw new OrderAdminError(400, "Stavka više ne postoji. Osvježite stranicu.");
    keptIds.add(raw.id);

    const line = existing.toObject();
    const label = describeItem(line).title;
    if (quantity !== line.quantity) changes.push(`${label}: količina ${line.quantity} → ${quantity}`);
    line.quantity = quantity;

    if ("unitPrice" in raw) {
      const price = parsePrice(raw.unitPrice);
      if (price !== line.unitPrice) {
        changes.push(`${label}: cijena ${money(line.unitPrice)} → ${money(price)}`);
        line.unitPrice = price;
        line.priceAgreed = price !== null;
      }
    }
    return line;
  });

  for (const removed of order.items.filter((entry) => !keptIds.has(entry._id.toString()))) {
    changes.push(`uklonjeno ${describeItem(removed.toObject()).title}`);
  }

  if (changes.length === 0) return order.toObject();

  order.items = lines;
  order.total = lines.reduce((sum, line) => sum + (line.unitPrice ?? 0) * line.quantity, 0);
  // Po dogovoru ostaje dok god neka stavka nema cijenu, ili custom torta sa željama čija cijena još nije dogovorena.
  order.hasPhonePrice = lines.some(
    (line) => line.unitPrice === null || (line.kind === "custom" && needsPhonePricing(line.custom) && !line.priceAgreed),
  );
  order.history.push({ action: "edit", summary: changes.join(" · "), by: user._id, byName: user.name, at: new Date() });

  await order.save();
  return order.toObject();
}
