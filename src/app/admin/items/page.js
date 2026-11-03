/* eslint-disable @next/next/no-img-element */
import { Suspense } from "react";
import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { listAllItems } from "@/lib/adminItems";
import { CAKE_CATEGORIES, ITEM_TYPES, OPTION_KEYS } from "@/data/items";
import { linkBtn } from "@/components/styles";
import AdminHeader from "@/components/admin/AdminHeader";

const chip = "rounded-full px-2.5 py-1 text-[10px] font-semibold";

function formatOption(option) {
  const price = option.price === null ? "po dogovoru" : `${option.price.toFixed(2).replace(".", ",")} €`;
  return `${OPTION_KEYS[option.key]} ${price}`;
}

async function ItemsList() {
  const user = await requirePageUser(["admin"]);
  const items = await listAllItems();

  return (
    <>
      <AdminHeader user={user} />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl text-ink">Proizvodi</h1>
            <p className="text-sm text-muted">Sakriveni proizvodi se ne vide na sajtu, ali ostaju u starim narudžbama.</p>
          </div>
          <Link href="/admin/items/new" className={linkBtn}>
            Novi proizvod
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Link
              key={item._id.toString()}
              href={`/admin/items/${item._id}`}
              className={`grid grid-cols-[64px_1fr] items-center gap-4 rounded-xl border border-line bg-card p-3 transition-colors hover:border-primary md:grid-cols-[64px_1fr_auto] ${
                item.active ? "" : "opacity-60"
              }`}
            >
              <img src={item.image} alt="" className="size-16 rounded-lg object-cover" />
              <div className="min-w-0">
                <strong className="block font-serif text-xl text-ink">{item.name.me}</strong>
                <span className="block text-xs text-muted">
                  {ITEM_TYPES[item.type]}
                  {item.category && ` · ${CAKE_CATEGORIES[item.category]}`} · {item.options.map(formatOption).join(" · ")}
                </span>
              </div>
              <div className="col-span-2 flex flex-wrap gap-2 md:col-span-1 md:justify-end">
                {!item.active && <span className={`${chip} bg-line text-ink`}>Sakriven</span>}
                {item.featured && <span className={`${chip} bg-blush text-primary`}>Na početnoj</span>}
                <span className={`${chip} border border-line text-muted`}>#{item.sortOrder}</span>
              </div>
            </Link>
          ))}
          {items.length === 0 && <p className="rounded-xl border border-line bg-card p-6 text-sm text-muted">Još nema proizvoda.</p>}
        </div>
      </div>
    </>
  );
}

export default function AdminItemsPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <ItemsList />
      </Suspense>
    </main>
  );
}
