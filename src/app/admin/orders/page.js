import { Suspense } from "react";
import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { addDays, todayInPodgorica } from "@/lib/date";
import { countNewOrders, listOrders, viewFilters } from "@/lib/adminOrders";
import AdminHeader from "@/components/admin/AdminHeader";
import OrderCard from "@/components/admin/OrderCard";

const VIEWS = [
  { value: "today", label: "Danas" },
  { value: "tomorrow", label: "Sutra" },
  { value: "new", label: "Nove" },
  { value: "upcoming", label: "Predstojeće" },
  { value: "all", label: "Sve" },
];

const WEEKDAYS = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"];

// "2026-11-04" -> "Sutra · srijeda 4. 11." (Intl daje ekavske nazive dana, pa su crnogorski ovdje).
function dayLabel(isoDate, today) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const text = `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()}. ${date.getUTCMonth() + 1}.`;
  if (isoDate === today) return `Danas · ${text}`;
  if (isoDate === addDays(today, 1)) return `Sutra · ${text}`;
  return text;
}

// Narudžbe su već sortirane po datumu, pa se samo grupišu u dane redom kojim dolaze.
function groupByDay(orders) {
  const groups = [];
  for (const order of orders) {
    const last = groups.at(-1);
    if (last?.date === order.pickupDate) last.orders.push(order);
    else groups.push({ date: order.pickupDate, orders: [order] });
  }
  return groups;
}

const EMPTY_TEXT = {
  today: "Danas nema narudžbi za preuzimanje.",
  tomorrow: "Za sutra još nema narudžbi.",
  new: "Nema novih narudžbi.",
  upcoming: "Nema predstojećih narudžbi.",
  all: "Još nema narudžbi.",
};

async function OrdersList({ searchParams }) {
  const user = await requirePageUser();
  const { view: requested } = await searchParams;
  const view = VIEWS.some((item) => item.value === requested) ? requested : "today";

  const [orders, newCount] = await Promise.all([listOrders(viewFilters(view)), countNewOrders()]);
  const today = todayInPodgorica();

  return (
    <>
      <AdminHeader user={user} />
      <div className="mx-auto flex max-w-4xl flex-col gap-5 px-5 py-8">
        <h1 className="font-serif text-3xl text-ink">Narudžbe</h1>

        <nav className="flex flex-wrap gap-2">
          {VIEWS.map((item) => (
            <Link
              key={item.value}
              href={`/admin/orders?view=${item.value}`}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                view === item.value ? "border-primary bg-primary text-white" : "border-line text-muted hover:border-primary hover:text-primary"
              }`}
            >
              {item.label}
              {item.value === "new" && newCount > 0 && (
                <span className={`rounded-full px-1.5 text-[10px] ${view === "new" ? "bg-white text-primary" : "bg-primary text-white"}`}>{newCount}</span>
              )}
            </Link>
          ))}
        </nav>

        {groupByDay(orders).map((group) => (
          <section key={group.date} className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold tracking-wider text-muted uppercase">
              {dayLabel(group.date, today)} · {group.orders.length}
            </h2>
            {group.orders.map((order) => (
              <OrderCard key={order._id.toString()} order={order} />
            ))}
          </section>
        ))}
        {orders.length === 0 && <p className="rounded-xl border border-line bg-card p-5 text-sm text-muted">{EMPTY_TEXT[view]}</p>}
      </div>
    </>
  );
}

export default function AdminOrdersPage({ searchParams }) {
  return (
    <main>
      <Suspense fallback={null}>
        <OrdersList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
