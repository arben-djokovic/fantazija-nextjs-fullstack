import { Suspense } from "react";
import Form from "next/form";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { requirePageUser } from "@/lib/auth";
import { addDays, todayInPodgorica } from "@/lib/date";
import { ORDER_TABS, countOrdersByTab, listOrders, tabFilters } from "@/lib/adminOrders";
import AdminHeader from "@/components/admin/AdminHeader";
import DayPicker from "@/components/admin/DayPicker";
import OrderCard from "@/components/admin/OrderCard";
import OrderSummary from "@/components/admin/OrderSummary";

// Sve je prvo; Nove su posljednje jer nemaju izabrani dan.
const TAB_LABELS = {
  new: "Nove",
  confirmed: "U izradi",
  ready: "Spremne",
  completed: "Preuzete",
  cancelled: "Otkazane",
  all: "Sve",
};

const EMPTY_TEXT = {
  new: "Nema novih narudžbi.",
  confirmed: "Za ovaj dan nema narudžbi u izradi.",
  ready: "Za ovaj dan nema spremnih narudžbi.",
  completed: "Za ovaj dan nema preuzetih narudžbi.",
  cancelled: "Za ovaj dan nema otkazanih narudžbi.",
  all: "Za ovaj dan nema narudžbi.",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const WEEKDAYS = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"];

// "2026-11-04" -> "Sutra · srijeda 4. 11." (Intl daje ekavske nazive dana, pa su crnogorski ovdje).
function dayLabel(isoDate, today) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const text = `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()}. ${date.getUTCMonth() + 1}.`;
  if (isoDate === today) return `Danas · ${text}`;
  if (isoDate === addDays(today, 1)) return `Sutra · ${text}`;
  if (isoDate === addDays(today, -1)) return `Juče · ${text}`;
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

// Adresa stranice; podrazumijevane vrijednosti (Sve, danas, Narudžbe) se izostavljaju.
function ordersHref({ tab, date, mode }, today) {
  const params = new URLSearchParams();
  if (tab !== "all") params.set("tab", tab);
  if (tab !== "new" && date !== today) params.set("date", date);
  if (mode === "summary") params.set("mode", "summary");
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

const pill = "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors";
const pillActive = "border-primary bg-primary text-white";
const pillIdle = "border-line text-muted hover:border-primary hover:text-primary";
const iconButton = "grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-primary hover:text-primary";

function OrderCards({ orders, backHref, grouped, today }) {
  const cards = (list) => list.map((order) => <OrderCard key={order._id.toString()} order={order} backHref={backHref} />);
  if (!grouped) return <div className="flex flex-col gap-2">{cards(orders)}</div>;

  return groupByDay(orders).map((group) => (
    <section key={group.date} className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold tracking-wider text-muted uppercase">
        {dayLabel(group.date, today)} · {group.orders.length}
      </h2>
      {cards(group.orders)}
    </section>
  ));
}

async function OrdersList({ searchParams }) {
  const user = await requirePageUser();
  const params = await searchParams;
  const today = todayInPodgorica();

  const search = typeof params.q === "string" ? params.q.trim().slice(0, 50) : "";
  const tab = ORDER_TABS.includes(params.tab) ? params.tab : "all";
  const date = ISO_DATE.test(params.date ?? "") ? params.date : today;
  const mode = params.mode === "summary" ? "summary" : "list";
  const current = { tab, date, mode };
  const href = (changes) => ordersHref({ ...current, ...changes }, today);

  // Pretraga ide kroz sve narudžbe, bez obzira na tab i dan, jer se obično ne zna za koji dan je kupac naručio.
  const [orders, counts] = await Promise.all([listOrders(search ? { q: search } : tabFilters(tab, date)), countOrdersByTab(date)]);
  const backHref = search ? `/admin/orders?q=${encodeURIComponent(search)}` : href({});
  const showDay = !search && tab !== "new";

  return (
    <>
      <AdminHeader user={user} />
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-4xl text-ink">Narudžbe</h1>
          <Form action="/admin/orders" className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Traži po imenu ili telefonu"
              aria-label="Traži narudžbe"
              className="h-10 w-full rounded-full border border-line bg-card pr-4 pl-9 text-sm text-ink outline-none focus:border-primary"
            />
          </Form>
        </div>

        <nav className="flex flex-wrap gap-2">
          {ORDER_TABS.map((value) => (
            <Link key={value} href={href({ tab: value })} className={`${pill} ${!search && tab === value ? pillActive : pillIdle}`}>
              {TAB_LABELS[value]}
              {/* Nove se ističu, jer čekaju da ih neko potvrdi. */}
              {value === "new" ? (
                counts.new > 0 && (
                  <span className={`rounded-full px-1.5 text-[10px] ${!search && tab === "new" ? "bg-white text-primary" : "bg-primary text-white"}`}>
                    {counts.new}
                  </span>
                )
              ) : (
                <span className="opacity-70">{counts[value]}</span>
              )}
            </Link>
          ))}
        </nav>

        {!search && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {showDay ? (
              <div className="flex items-center gap-2">
                <Link href={href({ date: addDays(date, -1) })} aria-label="Prethodni dan" className={iconButton}>
                  <ChevronLeft className="size-4" />
                </Link>
                <strong className="min-w-48 text-center text-sm text-ink capitalize">{dayLabel(date, today)}</strong>
                <Link href={href({ date: addDays(date, 1) })} aria-label="Sljedeći dan" className={iconButton}>
                  <ChevronRight className="size-4" />
                </Link>
                {date !== today && (
                  <Link href={href({ date: today })} className={`${pill} ${pillIdle} py-1.5`}>
                    Danas
                  </Link>
                )}
                <DayPicker date={date} hrefTemplate={href({ date: "__DATE__" })} />
              </div>
            ) : (
              <p className="text-sm text-muted">Sve nove narudžbe, za bilo koji dan.</p>
            )}

            <div className="flex gap-1 rounded-full border border-line bg-card p-1">
              {[
                { value: "list", label: "Narudžbe" },
                { value: "summary", label: "Zbir" },
              ].map((option) => (
                <Link
                  key={option.value}
                  href={href({ mode: option.value })}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    mode === option.value ? "bg-primary text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {search && (
          <p className="text-sm text-muted">
            Rezultati za <strong className="text-ink">„{search}”</strong>: {orders.length}
            <Link href={href({})} className="ml-3 font-semibold text-primary hover:text-ink">
              Očisti pretragu
            </Link>
          </p>
        )}

        {!search && mode === "summary" ? (
          <OrderSummary orders={orders} showDate={tab === "new"} />
        ) : (
          <OrderCards orders={orders} backHref={backHref} grouped={!showDay} today={today} />
        )}

        {orders.length === 0 && (
          <p className="rounded-xl border border-line bg-card p-5 text-sm text-muted">
            {search ? "Nema narudžbi za tu pretragu." : EMPTY_TEXT[tab]}
          </p>
        )}
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
