import { requireUser } from "@/lib/auth";
import { deleteItem, findItem, toItemError, updateItem } from "@/lib/adminItems";

function errorResponse(error) {
  const itemError = toItemError(error);
  if (itemError) return Response.json({ error: itemError.message }, { status: itemError.status });
  console.error("Greška pri radu sa proizvodom:", error);
  return Response.json({ error: "Akcija trenutno nije moguća" }, { status: 500 });
}

// Jedan proizvod: GET /api/admin/items/:id
export async function GET(request, { params }) {
  const { response } = await requireUser(["admin"]);
  if (response) return response;

  const { id } = await params;
  try {
    const item = await findItem(id);
    if (!item) return Response.json({ error: "Proizvod ne postoji" }, { status: 404 });
    return Response.json({ item });
  } catch (error) {
    return errorResponse(error);
  }
}

// Izmjena, mijenjaju se samo poslata polja: PATCH /api/admin/items/:id
export async function PATCH(request, { params }) {
  const { response } = await requireUser(["admin"]);
  if (response) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Neispravan JSON" }, { status: 400 });
  }

  const { id } = await params;
  try {
    return Response.json({ item: await updateItem(id, body) });
  } catch (error) {
    return errorResponse(error);
  }
}

// Brisanje, samo ako proizvod nikad nije naručen: DELETE /api/admin/items/:id
export async function DELETE(request, { params }) {
  const { response } = await requireUser(["admin"]);
  if (response) return response;

  const { id } = await params;
  try {
    await deleteItem(id);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
