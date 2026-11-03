import mongoose from "mongoose";
import { connection } from "next/server";
import { connectDB } from "@/lib/db";

// Provjera da li server radi i da li je baza povezana: GET /api/health
export async function GET() {
  // Provjera ima smisla samo pri zahtjevu, ne pri buildu.
  await connection();

  try {
    await connectDB();
    await mongoose.connection.db.admin().ping();

    return Response.json({
      status: "ok",
      database: mongoose.connection.name,
    });
  } catch (error) {
    console.error("Greška pri povezivanju na bazu:", error);
    return Response.json({ status: "error", message: "Baza nije dostupna" }, { status: 500 });
  }
}
