// Dozvoljene vrijednosti za proizvode. Koriste ih model (validacija) i admin forma (izbor i nazivi).
// Prevodi za sajt su u messages/*.json (Products.options, Products.badges, Offer.categories).

export const ITEM_TYPES = { cake: "Torta", pastry: "Kolač" };

export const CAKE_CATEGORIES = { classic: "Klasična", premium: "Premium", special: "Specijalna" };

export const OPTION_KEYS = {
  komad: "Komad",
  tepsija: "Tepsija",
  kilogram: "Kilogram",
  mala: "Mala",
  velika: "Velika",
  cijela: "Cijela",
  poDogovoru: "Po dogovoru",
};

export const BADGES = { glutenFree: "Bez glutena", fasting: "Posna" };

export const LOCALES = { me: "Crnogorski", sq: "Albanski", en: "Engleski" };
