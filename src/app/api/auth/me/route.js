import { requireUser, toPublicUser } from "@/lib/auth";

// Trenutno prijavljen korisnik: GET /api/auth/me
export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;
  return Response.json({ user: toPublicUser(user) });
}
