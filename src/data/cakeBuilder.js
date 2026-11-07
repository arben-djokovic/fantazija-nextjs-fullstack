// Pravila za tortu iz "Napravi sam". Koriste ih i builder (prikaz) i server (provjera i cijena narudžbe).
// Ukusi i veličine sa cijenama su torte iz baze (Item, type "cake") i njihove opcije.

export const PHOTO_EXTRA = 5;
export const MAX_CAKE_PHOTOS = 3; // koliko slika kupac može poslati za tortu

// Cijena opcije + doplata za sliku. null (cijena po dogovoru) ostaje null.
export function customCakePrice(optionPrice, photo) {
  return optionPrice === null || optionPrice === undefined ? null : optionPrice + (photo ? PHOTO_EXTRA : 0);
}

// Posebni zahtjevi se ne mogu odmah cijeniti, pa cijenu dogovaramo telefonom.
// cakeType "special" postoji samo u starim narudžbama, iz vremena kad je builder imao tipove torti.
export function needsPhonePricing({ cakeType, wishes }) {
  return cakeType === "special" || Boolean(wishes?.trim());
}

// Samo za stare narudžbe (prije nego što su ukusi došli iz baze): ukus iz buildera -> slug proizvoda iz ponude,
// da se u zbiru u adminu broje zajedno sa istom tortom iz ponude.
export const FLAVOUR_ITEM_SLUGS = {
  cokolada: "cokoladna",
  voca: "vocna",
  rafaelo: "rafaelo-torta",
};

// Samo za stare narudžbe: opcija iz ponude koja odgovara veličini stare torte iz buildera.
export function customCakeOptionKey({ cakeType, size }) {
  if (cakeType === "classic") return size === "large" ? "velika" : "mala";
  if (cakeType === "premium") return "cijela";
  return "poDogovoru";
}
