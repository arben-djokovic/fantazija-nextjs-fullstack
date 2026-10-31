// price: broj u eurima, null znači cijena po dogovoru (telefonom)

export const cakeCategories = [
  { value: "all", label: "Sve torte" },
  { value: "classic", label: "Klasične" },
  { value: "premium", label: "Premium" },
  { value: "special", label: "Specijalne" },
];

export const cakes = [
  {
    id: "cokoladna",
    name: "Čokoladna torta",
    category: "classic",
    desc: "Bogata čokolada, kremasta tekstura i poznati ukus.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85",
    options: [
      { label: "Mala", note: "oko 15 osoba", price: 15 },
      { label: "Velika", note: "oko 20 osoba", price: 20 },
    ],
  },
  {
    id: "vocna",
    name: "Voćna torta",
    category: "classic",
    desc: "Lagani krem, svježe voće i nježan biskvit.",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85",
    badges: ["Bez glutena"],
    options: [
      { label: "Mala", note: "oko 15 osoba", price: 15 },
      { label: "Velika", note: "oko 20 osoba", price: 20 },
    ],
  },
  {
    id: "rafaelo-torta",
    name: "Rafaelo torta",
    category: "premium",
    desc: "Kokos, bijela čokolada i badem u raskošnom sloju.",
    image: "https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&w=900&q=85",
    options: [{ label: "Cijela torta", price: 27 }],
  },
  {
    id: "pistachio",
    name: "Pistachio dream",
    category: "premium",
    desc: "Pistaći, bijela čokolada i svilenkasti krem.",
    image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=900&q=85",
    options: [{ label: "Cijela torta", price: 27 }],
  },
  {
    id: "svadbena",
    name: "Svadbena torta",
    category: "special",
    desc: "Torta po mjeri za vaš najvažniji dan.",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85",
    badges: ["Posna"],
    options: [{ label: "Po dogovoru", price: null }],
  },
  {
    id: "po-zamisli",
    name: "Torta po zamisli",
    category: "special",
    desc: "Vaša ideja, naši ukusi i pažljiva izrada.",
    image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=900&q=85",
    options: [{ label: "Po dogovoru", price: null }],
  },
];

export const pastries = [
  {
    id: "trilece",
    name: "Trileće",
    desc: "Meko, mliječno i nježno.",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=85",
    options: [
      { label: "Komad", price: 1.5 },
      { label: "Tepsija", price: 10 },
    ],
  },
  {
    id: "rafaelo",
    name: "Rafaelo",
    desc: "Kokos, bijela čokolada i badem.",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=85",
    options: [{ label: "Komad", price: 1.8 }],
  },
  {
    id: "baklava",
    name: "Baklava",
    desc: "Hrskavi listovi i domaći sirup.",
    image: "https://images.unsplash.com/photo-1519671282421-2d8d3f4f4f7a?auto=format&fit=crop&w=800&q=85",
    options: [
      { label: "Komad", price: 1.5 },
      { label: "Kilogram", price: 12 },
    ],
  },
];
