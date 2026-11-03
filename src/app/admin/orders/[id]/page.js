import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
import { EDITABLE_STATUSES, findOrder } from "@/lib/adminOrders";
import { getActiveItems } from "@/lib/items";
import { describeItem } from "@/lib/orderLines";
import { OPTION_KEYS } from "@/data/items";
import { ORDER_STATUSES } from "@/data/orders";
import AdminHeader from "@/components/admin/AdminHeader";
import OrderEditForm from "@/components/admin/OrderEditForm";

// Narudžba iz baze u običan objekat za formu (ID-jevi kao tekst, nazivi stavki već složeni).
function toFormOrder(order) {
  return {
    id: order._id.toString(),
    updatedAt: order.updatedAt.toISOString(),
    pickupDate: order.pickupDate,
    pickupTime: order.pickupTime,
    customer: order.customer,
    note: order.note ?? "",
    items: order.items.map((line) => ({
      id: line._id.toString(),
      ...describeItem(line),
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      priceAgreed: line.priceAgreed ?? false,
    })),
  };
}

// Aktivni proizvodi za dodavanje nove stavke.
function toCatalog(items) {
  return items.map((item) => ({
    id: item._id.toString(),
    name: item.name.me,
    options: item.options.map((option) => ({ id: option._id.toString(), label: OPTION_KEYS[option.key], price: option.price })),
  }));
}

async function EditOrder({ params, searchParams }) {
  const user = await requirePageUser();
  const { id } = await params;
  const { back } = await searchParams;
  // Vraća se na istu listu (tab, dan, prikaz); prihvata se samo adresa liste narudžbi.
  const backHref = typeof back === "string" && /^\/admin\/orders(\?|$)/.test(back) ? back : "/admin/orders";

  const order = await findOrder(id);
  if (!order) notFound();

  const editable = EDITABLE_STATUSES.includes(order.status);
  const catalog = editable ? toCatalog(await getActiveItems()) : [];

  return (
    <>
      <AdminHeader user={user} />
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-10">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="font-serif text-4xl text-ink">Izmjena narudžbe</h1>
          <Link href={backHref} className="text-sm font-semibold text-primary hover:text-ink">
            ← Nazad
          </Link>
        </div>
        {editable ? (
          <OrderEditForm order={toFormOrder(order)} catalog={catalog} backHref={backHref} />
        ) : (
          <p className="rounded-xl border border-line bg-card p-5 text-sm text-muted">
            Narudžba je &quot;{ORDER_STATUSES[order.status]}&quot; i više se ne može mijenjati. Izmjena je moguća samo dok je nova ili potvrđena.
          </p>
        )}
      </div>
    </>
  );
}

export default function EditOrderPage({ params, searchParams }) {
  return (
    <main>
      <Suspense fallback={null}>
        <EditOrder params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
