import mongoose from "mongoose";
import { defineModel } from "./model.js";
import { pickupTimes } from "../lib/date.js";
import { ORDER_STATUSES } from "../data/orders.js";

const isCatalogItem = function () {
  return this.kind === "item";
};

const isCustomCake = function () {
  return this.kind === "custom";
};

// Torta iz "Napravi sam": ukus i veličina su torta i opcija iz ponude (item, optionId na stavci),
// a dekoracija i detalji postoje samo u ovoj narudžbi, pa se čuvaju ovdje.
const customCakeSchema = new mongoose.Schema(
  {
    // Stare narudžbe (prije nego što su ukusi došli iz baze) nemaju item na stavci, nego tip, ukus i veličinu.
    cakeType: { type: String, enum: ["classic", "premium", "special"] },
    flavour: { type: String, trim: true },
    size: { type: String, enum: ["small", "large"] },
    photo: { type: Boolean, default: false }, // samo stare narudžbe: jestiva slika na torti, sa doplatom
    photos: [{ type: String }], // linkovi slika koje je kupac poslao (za tortu ili primjer dekoracije)
    inscription: { type: String, trim: true, maxlength: 100 },
    wishes: { type: String, trim: true, maxlength: 1000 },
    idea: { type: String, trim: true, maxlength: 1000 }, // samo stare specijalne torte
    fasting: { type: Boolean, default: false },
    glutenFree: { type: Boolean, default: false },
  },
  { _id: false }
);

// Naziv i cijena se kopiraju u trenutku narudžbe, da kasnija promjena ponude ne mijenja stare narudžbe.
const orderItemSchema = new mongoose.Schema({
  kind: { type: String, enum: ["item", "custom"], required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: isCatalogItem },
  optionId: { type: mongoose.Schema.Types.ObjectId, required: isCatalogItem },
  optionKey: { type: String, required: isCatalogItem },
  name: {
    me: { type: String, required: isCatalogItem },
    sq: { type: String, required: isCatalogItem },
    en: { type: String, required: isCatalogItem },
  },
  custom: { type: customCakeSchema, required: isCustomCake },
  quantity: { type: Number, required: true, min: 1, max: 100 },
  unitPrice: { type: Number, min: 0, default: null }, // null = cijena po dogovoru
  priceAgreed: { type: Boolean, default: false }, // cijenu je radnik upisao nakon dogovora sa kupcem
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true, trim: true, maxlength: 100 },
      phone: { type: String, required: true, trim: true, maxlength: 30 },
      viber: { type: Boolean, default: false }, // kupac želi potvrdu na Viber
    },
    // Datum kao "YYYY-MM-DD" da se dan ne pomjeri zbog vremenske zone.
    pickupDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    pickupTime: { type: String, required: true, enum: pickupTimes },
    items: {
      type: [orderItemSchema],
      validate: { validator: (items) => items.length > 0, message: "Narudžba mora imati bar jednu stavku" },
    },
    total: { type: Number, required: true, min: 0 }, // zbir stavki sa poznatom cijenom
    hasPhonePrice: { type: Boolean, default: false }, // bar jedna stavka se dogovara telefonom
    status: { type: String, enum: Object.keys(ORDER_STATUSES), default: "new" },
    note: { type: String, trim: true, maxlength: 1000 }, // interna napomena, kupac je ne vidi
    // Ko je i kada mijenjao status ili izmijenio narudžbu; ime se kopira da ostane i ako se nalog kasnije obriše.
    history: [
      {
        _id: false,
        action: { type: String, enum: ["status", "edit"], default: "status" },
        status: {
          type: String,
          enum: Object.keys(ORDER_STATUSES),
          required: function () {
            return this.action !== "edit";
          },
        },
        summary: { type: String }, // šta je izmijenjeno, samo za "edit"
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        byName: { type: String },
        at: { type: Date, default: Date.now },
      },
    ],
    locale: { type: String, enum: ["me", "sq", "en"], default: "me" }, // jezik na kojem je kupac naručio
  },
  { timestamps: true }
);

orderSchema.index({ pickupDate: 1, pickupTime: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default defineModel("Order", orderSchema);
