import { requireUser } from "@/lib/auth";
import { PRODUCT_FOLDER, imageFileError, uploadImage } from "@/lib/s3";

// Slika proizvoda na S3, vraća link koji se čuva u proizvodu: POST /api/admin/uploads (multipart, polje "file")
export async function POST(request) {
  const { response } = await requireUser(["admin"]);
  if (response) return response;

  let file;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return Response.json({ error: "Neispravan zahtjev" }, { status: 400 });
  }

  const invalid = imageFileError(file);
  if (invalid) return Response.json({ error: invalid }, { status: 400 });

  try {
    return Response.json({ url: await uploadImage(file, PRODUCT_FOLDER) }, { status: 201 });
  } catch (error) {
    console.error("Greška pri čuvanju slike na S3:", error);
    return Response.json({ error: "Slika trenutno ne može biti sačuvana" }, { status: 500 });
  }
}
