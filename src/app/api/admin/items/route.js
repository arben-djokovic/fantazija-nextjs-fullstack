import { requireUser } from "@/lib/auth";
import { createItem, listAllItems, toItemError } from "@/lib/adminItems";

// Svi proizvodi, i sakriveni: GET /api/admin/items
export async function GET() {
  const { response } = await requireUser(["admin"]);
  if (response) return response;

  try {
    return Response.json({ items: await listAllItems() });
  } catch (error) {
    console.error("Greška pri čitanju proizvoda:", error);
    return Response.json({ error: "Proizvodi trenutno nisu dostupni" }, { status: 500 });
  }
}

// Novi proizvod: POST /api/admin/items
export async function POST(request) {
  const { response } = await requireUser(["admin"]);
  if (response) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Neispravan JSON" }, { status: 400 });
  }

  try {
    const item = await createItem(body);
    return Response.json({ item }, { status: 201 });
  } catch (error) {
    const itemError = toItemError(error);
    if (itemError) return Response.json({ error: itemError.message }, { status: itemError.status });
    console.error("Greška pri dodavanju proizvoda:", error);
    return Response.json({ error: "Proizvod trenutno ne može biti sačuvan" }, { status: 500 });
  }
}
