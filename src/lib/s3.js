import "server-only";
import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Sve slike su u folderu fantazija-products (samo on je javan u bucket policy), a slike kupaca u podfolderu orders.
export const PRODUCT_FOLDER = "fantazija-products";
export const ORDER_PHOTO_FOLDER = "fantazija-products/orders";

// Dozvoljeni tipovi slika i ekstenzija pod kojom se čuvaju.
export const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

// Ključevi se čitaju iz AWS_ACCESS_KEY_ID i AWS_SECRET_ACCESS_KEY (.env.local).
let client;
function s3() {
  client ??= new S3Client({ region: process.env.BUCKET_REGION });
  return client;
}

// Javni link do foldera u bucketu, npr. https://bucket.s3.eu-north-1.amazonaws.com/fantazija-products/orders/
export function publicFolderUrl(folder) {
  return `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${folder}/`;
}

// Provjera fajla prije slanja; vraća poruku greške ili null.
export function imageFileError(file) {
  if (!file || typeof file === "string") return "Slika nije poslata";
  if (!IMAGE_TYPES[file.type]) return "Slika mora biti JPG, PNG, WEBP, AVIF ili GIF";
  if (file.size > MAX_IMAGE_SIZE) return "Slika smije imati najviše 5 MB";
  return null;
}

// Čuva sliku u bucket u zadati folder i vraća njen javni link.
export async function uploadImage(file, folder) {
  const bucket = process.env.BUCKET_NAME;
  if (!bucket || !process.env.BUCKET_REGION) throw new Error("BUCKET_NAME i BUCKET_REGION nisu podešeni");

  const name = `${randomUUID()}.${IMAGE_TYPES[file.type]}`;
  await s3().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: `${folder}/${name}`,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return publicFolderUrl(folder) + name;
}
