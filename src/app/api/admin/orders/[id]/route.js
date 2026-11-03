import { requireUser } from "@/lib/auth";
import { OrderAdminError, findOrder, updateOrder, updateOrderStatus } from "@/lib/adminOrders";

// Jedna narudžba: GET /api/admin/orders/:id
export async function GET(request, { params }) {
  const { response } = await requireUser();
  if (response) return response;

  const { id } = await params;
  try {
    const order = await findOrder(id);
    if (!order) return Response.json({ error: "Narudžba ne postoji" }, { status: 404 });
    return Response.json({ order });
  } catch (error) {
    console.error("Greška pri čitanju narudžbe:", error);
    return Response.json({ error: "Narudžba trenutno nije dostupna" }, { status: 500 });
  }
}

// Promjena statusa: PATCH /api/admin/orders/:id { status: "confirmed" }
export async function PATCH(request, { params }) {
  const { user, response } = await requireUser();
  if (response) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Neispravan JSON" }, { status: 400 });
  }

  const { id } = await params;
  try {
    return Response.json({ order: await updateOrderStatus(id, body?.status, user) });
  } catch (error) {
    if (error instanceof OrderAdminError) return Response.json({ error: error.message }, { status: error.status });
    console.error("Greška pri promjeni statusa:", error);
    return Response.json({ error: "Status trenutno ne može biti promijenjen" }, { status: 500 });
  }
}

// Izmjena narudžbe (termin, kupac, stavke, cijene, napomena): PUT /api/admin/orders/:id
export async function PUT(request, { params }) {
  const { user, response } = await requireUser();
  if (response) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Neispravan JSON" }, { status: 400 });
  }

  const { id } = await params;
  try {
    return Response.json({ order: await updateOrder(id, body, user) });
  } catch (error) {
    if (error instanceof OrderAdminError) return Response.json({ error: error.message }, { status: error.status });
    console.error("Greška pri izmjeni narudžbe:", error);
    return Response.json({ error: "Narudžba trenutno ne može biti sačuvana" }, { status: 500 });
  }
}
