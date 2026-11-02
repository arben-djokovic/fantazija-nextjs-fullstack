import mongoose from "mongoose";
import { OrderError, createOrder } from "@/lib/orders";

// Slanje narudžbe iz checkout-a: POST /api/orders
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Neispravan JSON", code: "INVALID" }, { status: 400 });
  }

  try {
    const order = await createOrder(body);
    return Response.json({ orderId: order._id.toString() }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderError) {
      return Response.json({ error: error.message, code: error.code }, { status: 400 });
    }
    if (error instanceof mongoose.Error.ValidationError) {
      return Response.json({ error: "Neispravni podaci narudžbe", code: "INVALID" }, { status: 400 });
    }
    console.error("Greška pri čuvanju narudžbe:", error);
    return Response.json({ error: "Narudžba trenutno ne može biti poslata", code: "SERVER" }, { status: 500 });
  }
}
