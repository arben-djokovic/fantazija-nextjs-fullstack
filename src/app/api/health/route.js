import mongoose from "mongoose";
import { connectDB } from "@/lib/db";

// Provjera da li server radi i da li je baza povezana: GET /api/health
export async function GET() {
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
