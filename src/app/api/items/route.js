import { getActiveItems } from "@/lib/items";

const TYPES = ["cake", "pastry"];
const CATEGORIES = ["classic", "premium", "special"];

// Lista aktivnih proizvoda: GET /api/items?type=cake&category=premium&featured=true
export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  if (type && !TYPES.includes(type)) {
    return Response.json({ error: "Nepoznat tip proizvoda" }, { status: 400 });
  }
  if (category && !CATEGORIES.includes(category)) {
    return Response.json({ error: "Nepoznata kategorija" }, { status: 400 });
  }

  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (featured === "true") filter.featured = true;

  try {
    const items = await getActiveItems(filter);
    return Response.json({ items });
  } catch (error) {
    console.error("Greška pri čitanju proizvoda:", error);
    return Response.json({ error: "Proizvodi trenutno nisu dostupni" }, { status: 500 });
  }
}
