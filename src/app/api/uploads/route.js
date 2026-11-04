import { ORDER_PHOTO_FOLDER, imageFileError, uploadImage } from "@/lib/s3";

// Ruta je javna (kupac nije prijavljen), pa je broj slanja ograničen po IP adresi.
// Brojač je u memoriji servera: dovoljno protiv slučajnog ili prostog zloupotrebljavanja.
const LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 sat
const uploadsByIp = new Map();

function tooMany(ip) {
  const now = Date.now();
  const recent = (uploadsByIp.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= LIMIT) return true;
  recent.push(now);
  uploadsByIp.set(ip, recent);
  return false;
}

// Slika koju kupac želi na torti iz "Napravi sam": POST /api/uploads (multipart, polje "file")
export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (tooMany(ip)) return Response.json({ error: "Previše slika, pokušajte kasnije", code: "RATE_LIMIT" }, { status: 429 });

  let file;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return Response.json({ error: "Slika nije poslata ili je veća od 5 MB", code: "INVALID" }, { status: 400 });
  }

  const invalid = imageFileError(file);
  if (invalid) return Response.json({ error: invalid, code: "INVALID" }, { status: 400 });

  try {
    return Response.json({ url: await uploadImage(file, ORDER_PHOTO_FOLDER) }, { status: 201 });
  } catch (error) {
    console.error("Greška pri čuvanju slike kupca na S3:", error);
    return Response.json({ error: "Slika trenutno ne može biti sačuvana", code: "SERVER" }, { status: 500 });
  }
}
