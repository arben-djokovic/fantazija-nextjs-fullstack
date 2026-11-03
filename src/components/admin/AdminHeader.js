import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

const ROLE_LABELS = { admin: "Vlasnik", staff: "Radnik" };

// Linkovi koje vidi korisnik sa datom ulogom.
const NAV = [
  { href: "/admin", label: "Početna", roles: ["admin", "staff"] },
  { href: "/admin/orders", label: "Narudžbe", roles: ["admin", "staff"] },
  { href: "/admin/items", label: "Proizvodi", roles: ["admin"] },
];

export default function AdminHeader({ user }) {
  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/admin" className="font-serif text-2xl text-ink">
            Fantazija
          </Link>
          <nav className="flex gap-4 text-sm font-semibold">
            {NAV.filter((link) => link.roles.includes(user.role)).map((link) => (
              <Link key={link.href} href={link.href} className="text-muted transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">
            {user.name} · {ROLE_LABELS[user.role]}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
