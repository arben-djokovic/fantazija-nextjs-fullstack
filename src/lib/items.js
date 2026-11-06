import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { itemImages } from "@/lib/images";
import Item from "@/models/Item";

// Aktivni proizvodi iz baze, torte pa kolači, po redoslijedu iz admina.
// connection() kaže Next-u da ovo čita pri svakom zahtjevu, a ne pri buildu (mongoose interno koristi new Date()).
export async function getActiveItems(filter = {}) {
  await connection();
  await connectDB();
  return Item.find({ ...filter, active: true }).sort({ type: 1, sortOrder: 1 }).lean();
}

// Pretvara proizvod iz baze u običan objekat za client komponente, sa nazivom i opisom na traženom jeziku.
export function toLocalizedItem(item, locale) {
  return {
    id: item._id.toString(),
    slug: item.slug,
    type: item.type,
    category: item.category ?? null,
    name: item.name[locale] ?? item.name.me,
    description: item.description[locale] ?? item.description.me,
    image: item.image,
    images: itemImages(item),
    badges: item.badges,
    options: item.options.map((option) => ({
      id: option._id.toString(),
      key: option.key,
      servings: option.servings ?? null,
      price: option.price,
      image: option.image ?? null,
    })),
  };
}
