import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "404 · Poslastičarnica Fantazija",
  description: "Stranica ne postoji.",
};

// Ovu stranicu Next.js prikazuje za adrese koje ne postoje, pa mora imati sopstveni <html> i <body>.
export default function GlobalNotFound() {
  return (
    <html lang="me">
      <body className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-cream text-ink">
        <p className="font-serif text-7xl leading-none">404</p>
        <p className="text-sm text-muted">Stranica ne postoji.</p>
        <Link href="/" className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white">
          Nazad na početnu
        </Link>
      </body>
    </html>
  );
}
