import mongoose from "mongoose";
import { after } from "next/server";
import { OrderError, createOrder } from "@/lib/orders";
import { sendNewOrderEmail } from "@/lib/orderEmail";

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
    // Mejl vlasniku ide nakon odgovora: kupac ne čeka, a narudžba je sačuvana i ako slanje ne uspije.
    after(async () => {
      try {
        await sendNewOrderEmail(order.toObject());
      } catch (error) {
        console.error("Mejl o novoj narudžbi nije poslat:", error);
      }
    });
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
