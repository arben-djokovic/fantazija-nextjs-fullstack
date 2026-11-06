import mongoose from "mongoose";
import { defineModel } from "./model.js";
import { BADGES, CAKE_CATEGORIES, ITEM_TYPES, OPTION_KEYS } from "../data/items.js";

// Naziv i opis proizvoda se unose na sva tri jezika (me, sq, en).
const localized = {
  me: { type: String, required: true, trim: true },
  sq: { type: String, required: true, trim: true },
  en: { type: String, required: true, trim: true },
};

const optionSchema = new mongoose.Schema({
  key: { type: String, enum: Object.keys(OPTION_KEYS), required: true },
  servings: { type: Number, min: 1 }, // broj osoba, tekst "oko {count} osoba" je u messages
  price: { type: Number, min: 0, default: null }, // null = cijena po dogovoru
  image: { type: String, trim: true }, // slika iz galerije proizvoda koja prikazuje ovu opciju (nije obavezno)
});

const itemSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+(-[a-z0-9]+)*$/ },
    type: { type: String, enum: Object.keys(ITEM_TYPES), required: true },
    category: {
      type: String,
      enum: Object.keys(CAKE_CATEGORIES),
      required: function () {
        return this.type === "cake";
      },
    }, // samo za torte
    name: localized,
    description: localized,
    image: { type: String, required: true, trim: true }, // glavna slika, uvijek prva iz images
    images: [{ type: String, trim: true }], // galerija (slider); stari proizvodi je nemaju, pa se koristi samo image
    badges: [{ type: String, enum: Object.keys(BADGES) }],
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

export default defineModel("Item", itemSchema);
