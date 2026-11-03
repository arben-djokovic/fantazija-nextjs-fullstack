import { requireUser } from "@/lib/auth";
import { OrderAdminError, listOrders, parseOrderFilters } from "@/lib/adminOrders";

// Lista narudžbi za vlasnika i radnike: GET /api/admin/orders?status=new,confirmed&date=2026-11-05&from=...&to=...
export async function GET(request) {
  const { response } = await requireUser();
  if (response) return response;

  try {
    const filters = parseOrderFilters(request.nextUrl.searchParams);
    return Response.json({ orders: await listOrders(filters) });
  } catch (error) {
    if (error instanceof OrderAdminError) return Response.json({ error: error.message }, { status: error.status });
    console.error("Greška pri čitanju narudžbi:", error);
    return Response.json({ error: "Narudžbe trenutno nisu dostupne" }, { status: 500 });
  }
}
