import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

// Jedan aktivan proizvod: GET /api/items/cokoladna
export async function GET(request, { params }) {
  const { slug } = await params;

  try {
    await connectDB();
    const item = await Item.findOne({ slug, active: true }).lean();

    if (!item) {
      return Response.json({ error: "Proizvod ne postoji" }, { status: 404 });
    }
    return Response.json({ item });
  } catch (error) {
    console.error("Greška pri čitanju proizvoda:", error);
    return Response.json({ error: "Proizvod trenutno nije dostupan" }, { status: 500 });
  }
}
