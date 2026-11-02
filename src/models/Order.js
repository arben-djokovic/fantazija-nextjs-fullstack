import mongoose from "mongoose";
import { pickupTimes } from "@/lib/date";

const isCatalogItem = function () {
  return this.kind === "item";
};

const isCustomCake = function () {
  return this.kind === "custom";
};

// Torta iz "Napravi sam" postoji samo u ovoj narudžbi, pa se njen sastav čuva ovdje, a ne kao Item.
const customCakeSchema = new mongoose.Schema(
  {
    cakeType: { type: String, enum: ["classic", "premium", "special"], required: true },
    flavour: {
      type: String,
      trim: true,
      required: function () {
        return this.cakeType !== "special";
      },
    },
    size: { type: String, enum: ["small", "large"] }, // samo za classic
    photo: { type: Boolean, default: false }, // jestiva slika na torti
    photos: [{ type: String }], // linkovi slika koje je kupac poslao
    inscription: { type: String, trim: true, maxlength: 100 },
    wishes: { type: String, trim: true, maxlength: 1000 },
    idea: { type: String, trim: true, maxlength: 1000 }, // samo za special
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
    status: {
      type: String,
      enum: ["new", "confirmed", "ready", "completed", "cancelled"],
      default: "new",
    },
    locale: { type: String, enum: ["me", "sq", "en"], default: "me" }, // jezik na kojem je kupac naručio
  },
  { timestamps: true }
);

orderSchema.index({ pickupDate: 1, pickupTime: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
