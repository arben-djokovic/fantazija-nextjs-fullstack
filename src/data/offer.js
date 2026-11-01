// Tekst (nazivi, opisi, nazivi opcija) je u messages/*.json, ovdje su samo ID-jevi i cijene.
// price: broj u eurima, null znači cijena po dogovoru (telefonom)

export const cakeCategories = [
  { value: "all" },
  { value: "classic" },
  { value: "premium" },
  { value: "special" },
];

export const cakes = [
  {
    id: "cokoladna",
    category: "classic",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85",
    options: [
      { key: "mala", note: "people15", price: 15 },
      { key: "velika", note: "people20", price: 20 },
    ],
  },
  {
    id: "vocna",
    category: "classic",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85",
    badges: ["glutenFree"],
    options: [
      { key: "mala", note: "people15", price: 15 },
      { key: "velika", note: "people20", price: 20 },
    ],
  },
  {
    id: "rafaelo-torta",
    category: "premium",
    image: "https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&w=900&q=85",
    options: [{ key: "cijela", price: 27 }],
  },
  {
    id: "pistachio",
    category: "premium",
    image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=900&q=85",
    options: [{ key: "cijela", price: 27 }],
  },
  {
    id: "svadbena",
    category: "special",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85",
    badges: ["fasting"],
    options: [{ key: "poDogovoru", price: null }],
  },
  {
    id: "po-zamisli",
    category: "special",
    image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=900&q=85",
    options: [{ key: "poDogovoru", price: null }],
  },
];

export const pastries = [
  {
    id: "trilece",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=85",
    options: [
      { key: "komad", price: 1.5 },
      { key: "tepsija", price: 10 },
    ],
  },
  {
    id: "rafaelo",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=85",
    options: [{ key: "komad", price: 1.8 }],
  },
  {
    id: "baklava",
    image: "https://images.unsplash.com/photo-1519671282421-2d8d3f4f4f7a?auto=format&fit=crop&w=800&q=85",
    options: [
      { key: "komad", price: 1.5 },
      { key: "kilogram", price: 12 },
    ],
  },
];
