import "server-only";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { readSession } from "@/lib/session";
import User from "@/models/User";

// Hash koji se poredi kad korisnik ne postoji, da odgovor traje isto i ne otkriva koja korisnička imena postoje.
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 12);

// Podaci o korisniku koji smiju ići u odgovor (bez lozinke).
export function toPublicUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    name: user.name,
    role: user.role,
  };
}

// Provjera korisničkog imena i lozinke; vraća korisnika ili null.
export async function verifyCredentials(username, password) {
  await connectDB();
  const user = await User.findOne({ username: username.toLowerCase().trim(), active: true }).select("+passwordHash");
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  return user && valid ? user : null;
}

// Trenutno prijavljen i aktivan korisnik, ili null.
export async function getCurrentUser() {
  const session = await readSession();
  if (!session || !mongoose.isValidObjectId(session.userId)) return null;

  await connectDB();
  return User.findOne({ _id: session.userId, active: true }).lean();
}

// Za API rute: vraća { user } ili { response } sa 401/403 koji ruta odmah vraća.
// Primjer: const { user, response } = await requireUser(["admin"]); if (response) return response;
export async function requireUser(roles) {
  const user = await getCurrentUser();
  if (!user) {
    return { response: Response.json({ error: "Niste prijavljeni" }, { status: 401 }) };
  }
  if (roles && !roles.includes(user.role)) {
    return { response: Response.json({ error: "Nemate dozvolu" }, { status: 403 }) };
  }
  return { user };
}

// Za admin stranice: neprijavljenog šalje na prijavu, a radnika bez dozvole na početnu admina.
export async function requirePageUser(roles) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (roles && !roles.includes(user.role)) redirect("/admin");
  return user;
}
