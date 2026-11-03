import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { pickupTimes, todayInPodgorica } from "@/lib/date";
import { CAKE_TYPES, FLAVOURS, SIZE_PRICES, customCakePrice, needsPhonePricing } from "@/data/cakeBuilder";
import { routing } from "@/i18n/routing";
import Item from "@/models/Item";
import Order from "@/models/Order";

const MAX_ITEMS = 50;
const MAX_QUANTITY = 100;

// Greška koju kupac može ispraviti (pogrešni podaci, proizvod više ne postoji), vraća se kao 400.
export class OrderError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export const text = (value) => (typeof value === "string" ? value.trim() : "");

export function isRealDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function parseQuantity(value) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new OrderError("INVALID", "Neispravna količina");
  }
  return quantity;
}

// Torta iz buildera: prihvataju se samo poznate vrijednosti, a cijenu računa server.
function buildCustomItem(raw) {
  const custom = raw.custom ?? {};
  const cakeType = custom.cakeType;
  if (!Object.hasOwn(CAKE_TYPES, cakeType)) throw new OrderError("INVALID", "Nepoznat tip torte");

  const cake = {
    cakeType,
    photo: custom.photo === true,
    inscription: text(custom.inscription) || undefined,
    wishes: text(custom.wishes) || undefined,
    fasting: custom.fasting === true,
    glutenFree: custom.glutenFree === true,
  };

  if (cakeType === "special") {
    cake.idea = text(custom.idea) || undefined;
  } else {
    if (!FLAVOURS[cakeType].includes(custom.flavour)) throw new OrderError("INVALID", "Nepoznat ukus torte");
    cake.flavour = custom.flavour;
  }

  if (cakeType === "classic") {
    if (!Object.hasOwn(SIZE_PRICES, custom.size)) throw new OrderError("INVALID", "Nepoznata veličina torte");
    cake.size = custom.size;
  }

  return {
    kind: "custom",
    custom: cake,
    quantity: parseQuantity(raw.quantity),
    unitPrice: customCakePrice(cake),
    phonePrice: needsPhonePricing(cake),
  };
}

// Stavka iz ponude: naziv i cijena se uzimaju iz baze, ne iz browsera.
export function buildCatalogItem(raw, itemsById) {
  const item = itemsById.get(String(raw.itemId));
  const option = item?.options.find((entry) => entry._id.toString() === String(raw.optionId));
  if (!option) throw new OrderError("ITEM_UNAVAILABLE", "Proizvod ili opcija više nije dostupna");

  return {
    kind: "item",
    item: item._id,
    optionId: option._id,
    optionKey: option.key,
    name: item.name,
    quantity: parseQuantity(raw.quantity),
    unitPrice: option.price,
    phonePrice: option.price === null,
  };
}

export async function createOrder(body) {
  const customer = {
    name: text(body?.customer?.name),
    phone: text(body?.customer?.phone),
    viber: body?.customer?.viber === true,
  };
  if (!customer.name || !customer.phone) throw new OrderError("INVALID", "Ime i telefon su obavezni");

  const pickupDate = text(body?.pickupDate);
  if (!isRealDate(pickupDate) || pickupDate <= todayInPodgorica()) {
    throw new OrderError("INVALID", "Datum preuzimanja mora biti najranije sutra");
  }
  const pickupTime = text(body?.pickupTime);
  if (!pickupTimes.includes(pickupTime)) throw new OrderError("INVALID", "Nepoznat termin preuzimanja");

  const rawItems = Array.isArray(body?.items) ? body.items : [];
  if (rawItems.length === 0 || rawItems.length > MAX_ITEMS) throw new OrderError("INVALID", "Neispravan broj stavki");

  await connectDB();

  const itemIds = rawItems
    .filter((raw) => raw?.kind === "item" && mongoose.isValidObjectId(raw.itemId))
    .map((raw) => raw.itemId);
  const catalogItems = await Item.find({ _id: { $in: itemIds }, active: true }).lean();
  const itemsById = new Map(catalogItems.map((item) => [item._id.toString(), item]));

  const lines = rawItems.map((raw) => {
    if (raw?.kind === "custom") return buildCustomItem(raw);
    if (raw?.kind === "item") return buildCatalogItem(raw, itemsById);
    throw new OrderError("INVALID", "Nepoznata vrsta stavke");
  });

  const order = await Order.create({
    customer,
    pickupDate,
    pickupTime,
    items: lines.map(({ phonePrice, ...line }) => line),
    total: lines.reduce((sum, line) => sum + (line.unitPrice ?? 0) * line.quantity, 0),
    hasPhonePrice: lines.some((line) => line.phonePrice),
    locale: routing.locales.includes(body?.locale) ? body.locale : routing.defaultLocale,
  });

  return order;
}
