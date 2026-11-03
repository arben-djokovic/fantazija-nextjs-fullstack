// Pravi novi nalog za admin dio (vlasnik ili radnik).
// Pokretanje: npm run create-user -- <korisnickoIme> "<Ime i prezime>" [admin|staff]
// Lozinku skripta traži nakon pokretanja, da ne ostane u istoriji terminala.
import { createInterface } from "node:readline/promises";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const [username, name, role = "staff"] = process.argv.slice(2);

if (!username || !name || !["admin", "staff"].includes(role)) {
  console.error('Upotreba: npm run create-user -- <korisnickoIme> "<Ime i prezime>" [admin|staff]');
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = await rl.question("Lozinka (najmanje 8 znakova): ");
rl.close();

if (password.length < 8) {
  console.error("Lozinka mora imati najmanje 8 znakova.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

try {
  const user = await User.create({ username, name, role, passwordHash: await bcrypt.hash(password, 12) });
  console.log(`Napravljen nalog "${user.username}" (${user.role}).`);
} catch (error) {
  console.error(error.code === 11000 ? `Korisničko ime "${username}" je zauzeto.` : error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
