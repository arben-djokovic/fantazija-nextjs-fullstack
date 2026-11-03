import "../globals.css";

export const metadata = {
  title: "Admin · Fantazija",
  robots: { index: false, follow: false },
};

// Admin dio je van [locale], na crnogorskom, pa ima svoj <html> i <body>.
export default function AdminLayout({ children }) {
  return (
    <html lang="me" data-scroll-behavior="smooth">
      <body className="min-h-screen w-full bg-cream text-ink">{children}</body>
    </html>
  );
}
