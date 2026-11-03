// Statusi narudžbe i dozvoljeni prelazi. Koriste ih model, API i admin stranica.

export const ORDER_STATUSES = {
  new: "Nova",
  confirmed: "U izradi",
  ready: "Spremna",
  completed: "Preuzeta",
  cancelled: "Otkazana",
};

// Iz kog statusa u koji se smije preći. Koraci unazad postoje da se ispravi greška (npr. slučajno "Spremno").
export const STATUS_TRANSITIONS = {
  new: ["confirmed", "cancelled"],
  confirmed: ["ready", "cancelled"],
  ready: ["completed", "confirmed", "cancelled"],
  completed: ["ready"],
  cancelled: [], // otkazana narudžba je konačna
};

// Natpisi na dugmadima za prelaz u dati status.
export const STATUS_ACTIONS = {
  confirmed: "Potvrdi",
  ready: "Spremno",
  completed: "Preuzeto",
  cancelled: "Otkaži",
};
