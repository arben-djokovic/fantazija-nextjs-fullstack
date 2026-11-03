// Ubacuje demo narudžbe da se vidi kako izgleda admin (danas, sutra, naredni dani, razni statusi).
// Pokretanje: npm run seed:orders            -> briše stare demo narudžbe i ubacuje nove
//             npm run seed:orders -- --clear -> samo briše demo narudžbe
// Demo narudžbe se prepoznaju po broju telefona "+382 69 000 ...", pa prave narudžbe ostaju netaknute.
import mongoose from "mongoose";
import Item from "../src/models/Item.js";
import Order from "../src/models/Order.js";
import { addDays, todayInPodgorica } from "../src/lib/date.js";
import { customCakePrice, needsPhonePricing } from "../src/data/cakeBuilder.js";

const DEMO_PHONE = /^\+382 69 000 /;
const today = todayInPodgorica();

await mongoose.connect(process.env.MONGODB_URI);

const removed = await Order.deleteMany({ "customer.phone": DEMO_PHONE });
console.log(`Obrisano demo narudžbi: ${removed.deletedCount}`);

if (process.argv.includes("--clear")) {
  await mongoose.disconnect();
  process.exit(0);
}

const items = Object.fromEntries((await Item.find().lean()).map((item) => [item.slug, item]));

// Stavka iz ponude: naziv i cijena iz baze, kao kad naručuje kupac.
const fromCatalog = (slug, optionKey, quantity) => {
  const item = items[slug];
  const option = item.options.find((entry) => entry.key === optionKey);
  return { kind: "item", item: item._id, optionId: option._id, optionKey, name: item.name, quantity, unitPrice: option.price };
};

const customCake = (custom, quantity = 1) => ({ kind: "custom", custom, quantity, unitPrice: customCakePrice(custom) });

// Istorija statusa do datog statusa, sa izmišljenim radnicima.
const STEPS = ["confirmed", "ready", "completed"];
const historyUntil = (status, createdAt) => {
  if (status === "new") return [];
  if (status === "cancelled") return [{ status, byName: "Vlasnik (demo)", at: new Date(createdAt.getTime() + 40 * 60000) }];
  return STEPS.slice(0, STEPS.indexOf(status) + 1).map((step, index) => ({
    status: step,
    byName: index % 2 === 0 ? "Ana (demo)" : "Marko (demo)",
    at: new Date(createdAt.getTime() + (index + 1) * 45 * 60000),
  }));
};

const demo = [
  // Danas
  { day: 0, time: "09:00", status: "completed", name: "Milica Petrović", viber: true, locale: "me", lines: [fromCatalog("trilece", "tepsija", 1), fromCatalog("baklava", "tepsija", 1)] },
  { day: 0, time: "11:00", status: "ready", name: "Arben Gjokaj", viber: false, locale: "sq", lines: [customCake({ cakeType: "classic", flavour: "kinder", size: "large", photo: true, inscription: "Gëzuar ditëlindjen, Ena!" })] },
  { day: 0, time: "13:00", status: "confirmed", name: "Jelena Vuković", viber: true, locale: "me", lines: [fromCatalog("cokoladna", "velika", 1), fromCatalog("rafaelo", "komad", 12)] },
  { day: 0, time: "17:00", status: "new", name: "Sarah Miller", viber: false, locale: "en", lines: [fromCatalog("pistachio", "cijela", 1)] },
  // Sutra
  { day: 1, time: "10:00", status: "confirmed", name: "Nikola Đurović", viber: true, locale: "me", lines: [customCake({ cakeType: "premium", flavour: "ferrero", photo: false, inscription: "Srećan rođendan, tata", fasting: false, glutenFree: true })] },
  { day: 1, time: "12:00", status: "new", name: "Elira Hoti", viber: true, locale: "sq", lines: [fromCatalog("trilece", "komad", 20), fromCatalog("vocna", "mala", 1)] },
  { day: 1, time: "15:00", status: "new", name: "Ivana Radović", viber: false, locale: "me", lines: [customCake({ cakeType: "classic", flavour: "cokolada", size: "small", photo: false, wishes: "Bez oraha, dijete je alergično" })] },
  { day: 1, time: "18:00", status: "cancelled", name: "Marko Lazović", viber: false, locale: "me", lines: [fromCatalog("baklava", "komad", 10)] },
  // Narednih dana
  { day: 3, time: "11:00", status: "new", name: "Ana i Stefan", viber: true, locale: "me", lines: [customCake({ cakeType: "special", idea: "Svadbena torta na tri sprata, bijela sa svježim ružama, za oko 120 gostiju", photo: false })] },
  { day: 4, time: "16:00", status: "confirmed", name: "Driton Krasniqi", viber: true, locale: "sq", lines: [fromCatalog("svadbena", "poDogovoru", 1), fromCatalog("rafaelo", "komad", 50)] },
  { day: 6, time: "10:00", status: "new", name: "Tamara Bošković", viber: false, locale: "me", lines: [customCake({ cakeType: "premium", flavour: "redVelvet", photo: true, inscription: "18" }), fromCatalog("trilece", "tepsija", 2)] },
  // Juče (već preuzeto)
  { day: -1, time: "14:00", status: "completed", name: "Luka Vujošević", viber: false, locale: "me", lines: [fromCatalog("vocna", "velika", 1)] },
];

const orders = demo.map((entry, index) => {
  const createdAt = new Date(Date.now() - (demo.length - index) * 3 * 3600000);
  return {
    customer: { name: entry.name, phone: `+382 69 000 ${String(100 + index)}`, viber: entry.viber },
    pickupDate: addDays(today, entry.day),
    pickupTime: entry.time,
    items: entry.lines,
    total: entry.lines.reduce((sum, line) => sum + (line.unitPrice ?? 0) * line.quantity, 0),
    hasPhonePrice: entry.lines.some((line) => line.unitPrice === null || (line.kind === "custom" && needsPhonePricing(line.custom))),
    status: entry.status,
    history: historyUntil(entry.status, createdAt),
    locale: entry.locale,
    createdAt,
  };
});

await Order.insertMany(orders);
console.log(`Ubačeno demo narudžbi: ${orders.length} (danas ${demo.filter((d) => d.day === 0).length}, sutra ${demo.filter((d) => d.day === 1).length}).`);

await mongoose.disconnect();
