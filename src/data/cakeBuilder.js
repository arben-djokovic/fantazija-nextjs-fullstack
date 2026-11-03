// Pravila za tortu iz "Napravi sam". Koriste ih i builder (prikaz) i server (provjera i cijena narudžbe).
// price: broj u eurima, null znači cijena po dogovoru (telefonom)

export const CAKE_TYPES = {
  classic: { icon: "01", price: 15 },
  premium: { icon: "02", price: 27 },
  special: { icon: "03", price: null },
};

export const FLAVOURS = {
  classic: ["cokolada", "voca", "plazma", "kinder"],
  premium: ["rafaelo", "ferrero", "pistachio", "redVelvet"],
};

export const SIZE_PRICES = {
  small: 15,
  large: 20,
};

export const PHOTO_EXTRA = 5;

// Osnovna cijena: classic po veličini, premium fiksno, special po dogovoru.
export function customCakeBasePrice({ cakeType, size }) {
  if (cakeType === "classic") return SIZE_PRICES[size];
  return CAKE_TYPES[cakeType].price;
}

export function customCakePrice(cake) {
  const base = customCakeBasePrice(cake);
  return base === null ? null : base + (cake.photo ? PHOTO_EXTRA : 0);
}

// Posebni zahtjevi i specijalne torte se ne mogu odmah cijeniti, pa cijenu dogovaramo telefonom.
export function needsPhonePricing({ cakeType, wishes }) {
  return cakeType === "special" || Boolean(wishes?.trim());
}

// Za zbir u adminu: ukus iz buildera koji je ista torta kao proizvod iz ponude (slug), da se broje zajedno.
// Ukusi kojih nema u ponudi (Plazma, Ferrero, Pistachio, Red velvet) dobijaju svoj red.
// Kinder iz buildera je klasična torta (mala/velika), a Kinder iz ponude premium (cijela), pa se ne spajaju.
export const FLAVOUR_ITEM_SLUGS = {
  cokolada: "cokoladna",
  voca: "vocna",
  rafaelo: "rafaelo-torta",
};

// Opcija iz ponude koja odgovara veličini torte iz buildera: classic mala/velika, premium cijela.
export function customCakeOptionKey({ cakeType, size }) {
  if (cakeType === "classic") return size === "large" ? "velika" : "mala";
  if (cakeType === "premium") return "cijela";
  return "poDogovoru";
}
