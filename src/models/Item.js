import mongoose from "mongoose";

// Naziv i opis proizvoda se unose na sva tri jezika (me, sq, en).
const localized = {
  me: { type: String, required: true, trim: true },
  sq: { type: String, required: true, trim: true },
  en: { type: String, required: true, trim: true },
};

const optionSchema = new mongoose.Schema({
  key: { type: String, enum: ["komad", "tepsija", "kilogram", "mala", "velika", "cijela", "poDogovoru"], required: true },
  servings: { type: Number, min: 1 }, // broj osoba, tekst "oko {count} osoba" je u messages
  price: { type: Number, min: 0, default: null }, // null = cijena po dogovoru
});

const itemSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: { type: String, enum: ["cake", "pastry"], required: true },
    category: { type: String, enum: ["classic", "premium", "special"] }, // samo za torte
    name: localized,
    description: localized,
    image: { type: String, required: true },
    badges: [{ type: String, enum: ["glutenFree", "fasting"] }],
    options: {
      type: [optionSchema],
      validate: { validator: (options) => options.length > 0, message: "Proizvod mora imati bar jednu opciju" },
    },
    featured: { type: Boolean, default: false }, // prikazuje se na početnoj
    active: { type: Boolean, default: true }, // sakriven iz ponude bez brisanja
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

itemSchema.index({ type: 1, active: 1, sortOrder: 1 });

// U dev modu se fajl učitava više puta, pa koristimo već registrovan model ako postoji.
export default mongoose.models.Item || mongoose.model("Item", itemSchema);
