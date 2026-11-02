// Ubacuje početne proizvode iz scripts/seed-items.json u bazu.
// Pokretanje: npm run seed
// Može se pokrenuti više puta: postojeći proizvodi (po slug-u) se ažuriraju, ne dupliraju.
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";
import Item from "../src/models/Item.js";

const items = JSON.parse(await readFile(new URL("./seed-items.json", import.meta.url), "utf8"));

await mongoose.connect(process.env.MONGODB_URI);
console.log(`Baza: ${mongoose.connection.name}`);

for (const data of items) {
  const existing = await Item.findOne({ slug: data.slug });
  if (existing) {
    // Opcije se zamjenjuju cijele; postojeće opcije sa istim ključem zadržavaju svoj _id.
    data.options = data.options.map((option) => {
      const old = existing.options.find((o) => o.key === option.key);
      return old ? { ...option, _id: old._id } : option;
    });
    existing.set(data);
    await existing.save();
    console.log(`ažuriran  ${data.slug}`);
  } else {
    await Item.create(data);
    console.log(`dodat     ${data.slug}`);
  }
}

await mongoose.disconnect();
console.log(`Gotovo: ${items.length} proizvoda.`);
