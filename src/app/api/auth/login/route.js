import { toPublicUser, verifyCredentials } from "@/lib/auth";
import { createSession } from "@/lib/session";

// Prijava: POST /api/auth/login { username, password }
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Neispravan JSON" }, { status: 400 });
  }

  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!username.trim() || !password) {
    return Response.json({ error: "Unesite korisničko ime i lozinku" }, { status: 400 });
  }

  try {
    const user = await verifyCredentials(username, password);
    if (!user) {
      return Response.json({ error: "Pogrešno korisničko ime ili lozinka" }, { status: 401 });
    }

    await createSession(user._id.toString());
    return Response.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error("Greška pri prijavi:", error);
    return Response.json({ error: "Prijava trenutno nije moguća" }, { status: 500 });
  }
}
