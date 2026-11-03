import { Suspense } from "react";
import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import AdminHeader from "@/components/admin/AdminHeader";

// Sesija se čita iz cookie-ja, pa je provjera unutar Suspense granice.
async function AdminHome() {
  const user = await requirePageUser();

  return (
    <>
      <AdminHeader user={user} />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10">
        <h1 className="font-serif text-4xl text-ink">Dobro došli, {user.name}</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link href="/admin/orders" className="rounded-2xl border border-line bg-card p-6 transition-colors hover:border-primary">
            <strong className="block font-serif text-2xl text-ink">Narudžbe</strong>
            <span className="text-sm text-muted">Narudžbe za danas, sutra i nove, sa potvrdom i promjenom statusa.</span>
          </Link>
          {user.role === "admin" && (
            <Link href="/admin/items" className="rounded-2xl border border-line bg-card p-6 transition-colors hover:border-primary">
              <strong className="block font-serif text-2xl text-ink">Proizvodi</strong>
              <span className="text-sm text-muted">Dodavanje, izmjena i sakrivanje proizvoda iz ponude.</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default function AdminPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <AdminHome />
      </Suspense>
    </main>
  );
}
