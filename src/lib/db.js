import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI nije postavljen u .env.local");
}

// U dev modu Next ponovo učitava module pri svakoj izmjeni, pa konekciju čuvamo na globalu da ne otvaramo novu svaki put.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Ako konekcija padne, brišemo promise da sljedeći poziv pokuša ponovo.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
