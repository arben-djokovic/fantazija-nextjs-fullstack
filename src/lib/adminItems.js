import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { LOCALES } from "@/data/items";
import Item from "@/models/Item";
import Order from "@/models/Order";

// Greška koju admin može ispraviti; status ide u odgovor rute.
export class ItemError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const FIELD_LABELS = {
  slug: "Slug (adresa)",
  type: "Vrsta",
  category: "Kategorija",
  image: "Slika",
  options: "Opcije",
  sortOrder: "Redoslijed",
};

// Polje iz mongoose greške u naziv na crnogorskom, npr. "name.sq" -> "Naziv (Albanski)".
function fieldLabel(path) {
  const [field, locale] = path.split(".");
  if ((field === "name" || field === "description") && LOCALES[locale]) {
    return `${field === "name" ? "Naziv" : "Opis"} (${LOCALES[locale]})`;
  }
  return FIELD_LABELS[field] ?? path;
}

// Pretvara grešku iz baze u poruku za admina, ili vraća null ako je greška servera.
export function toItemError(error) {
  if (error instanceof ItemError) return error;
  if (error instanceof mongoose.Error.ValidationError) {
    const labels = [...new Set(Object.keys(error.errors).map(fieldLabel))];
    return new ItemError(400, `Provjerite polja: ${labels.join(", ")}`);
  }
  if (error?.code === 11000) return new ItemError(409, "Proizvod sa tim slug-om već postoji");
  return null;
}

const text = (value) => (typeof value === "string" ? value.trim() : undefined);

const localized = (value) =>
  Object.fromEntries(Object.keys(LOCALES).map((locale) => [locale, text(value?.[locale]) ?? ""]));

const optionalNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) throw new ItemError(400, "Cijena, broj osoba i redoslijed moraju biti brojevi");
  return number;
};

// Uzima samo dozvoljena polja iz zahtjeva. Kod izmjene (existing) mijenjaju se samo poslata polja,
// a opcije koje već postoje zadržavaju svoj _id, jer na njih pokazuju narudžbe.
function pickItemFields(body, existing) {
  const data = {};

  if ("slug" in body) {
    data.slug = text(body.slug);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(data.slug ?? "")) {
      throw new ItemError(400, "Slug smije imati samo mala slova bez kvačica, brojeve i crtice (npr. cokoladna-torta)");
    }
  }
  if ("type" in body) data.type = text(body.type);
  if ("name" in body) data.name = localized(body.name);
  if ("description" in body) data.description = localized(body.description);
  if ("image" in body) {
    data.image = text(body.image);
    if (data.image && !/^https?:\/\//.test(data.image)) throw new ItemError(400, "Slika mora biti link (http/https)");
  }
  if ("badges" in body) data.badges = Array.isArray(body.badges) ? [...new Set(body.badges)] : [];
  if ("featured" in body) data.featured = body.featured === true;
  if ("active" in body) data.active = body.active === true;
  if ("sortOrder" in body) data.sortOrder = optionalNumber(body.sortOrder) ?? 0;

  if ("options" in body) {
    const options = Array.isArray(body.options) ? body.options : [];
    data.options = options.map((option) => {
      const old = existing?.options.find((entry) => entry._id.toString() === option?.id);
      return {
        ...(old && { _id: old._id }),
        key: text(option?.key),
        servings: optionalNumber(option?.servings) ?? undefined,
        price: optionalNumber(option?.price),
      };
    });
  }

  // Kategorija postoji samo za torte, pa se kolaču briše.
  if ("category" in body || "type" in body) {
    const type = data.type ?? existing?.type;
    data.category = type === "cake" ? text(body.category) ?? existing?.category : undefined;
  }

  return data;
}

export async function listAllItems() {
  await connectDB();
  return Item.find().sort({ type: 1, sortOrder: 1, createdAt: 1 }).lean();
}

export async function findItem(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  return Item.findById(id).lean();
}

export async function createItem(body) {
  await connectDB();
  const item = await Item.create(pickItemFields(body ?? {}));
  return item.toObject();
}

export async function updateItem(id, body) {
  if (!mongoose.isValidObjectId(id)) throw new ItemError(404, "Proizvod ne postoji");
  await connectDB();

  const item = await Item.findById(id);
  if (!item) throw new ItemError(404, "Proizvod ne postoji");

  const { category, ...data } = pickItemFields(body ?? {}, item);
  item.set(data);
  if ("category" in body || "type" in body) item.category = category;
  await item.save();
  return item.toObject();
}

// Proizvod koji je već naručivan se ne briše (stare narudžbe pokazuju na njega), nego se sakrije.
export async function deleteItem(id) {
  if (!mongoose.isValidObjectId(id)) throw new ItemError(404, "Proizvod ne postoji");
  await connectDB();

  const item = await Item.findById(id);
  if (!item) throw new ItemError(404, "Proizvod ne postoji");

  if (await Order.exists({ "items.item": item._id })) {
    throw new ItemError(409, "Proizvod je već naručivan, pa se ne može obrisati. Sakrijte ga isključivanjem opcije Aktivan.");
  }
  await item.deleteOne();
}
