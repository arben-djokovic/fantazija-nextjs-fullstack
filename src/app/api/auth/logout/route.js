import { deleteSession } from "@/lib/session";

// Odjava: POST /api/auth/logout
export async function POST() {
  await deleteSession();
  return Response.json({ ok: true });
}
