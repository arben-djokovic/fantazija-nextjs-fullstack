import Link from "next/link";
import { ORDER_STATUSES } from "@/data/orders";
import { EDITABLE_STATUSES } from "@/lib/adminOrders";
import { formatPrice } from "@/lib/format";
import { describeItem } from "@/lib/orderLines";
import OrderActions from "@/components/admin/OrderActions";
import OrderPhotos from "@/components/admin/OrderPhotos";

// Boja oznake statusa i kartice: traka lijevo i blaga pozadina, da se status vidi i bez čitanja.
const STATUS_STYLES = {
  new: "bg-primary text-white",
  confirmed: "bg-amber-100 text-amber-800",
  ready: "bg-emerald-100 text-emerald-800",
  completed: "bg-line text-muted",
  cancelled: "bg-line text-muted line-through",
};

const CARD_STYLES = {
  new: "border-l-primary bg-blush/40",
  confirmed: "border-l-amber-400 bg-amber-50/60",
  ready: "border-l-emerald-500 bg-emerald-50/60",
  completed: "border-l-line bg-cream",
  cancelled: "border-l-line bg-cream opacity-60",
};

const timeFormat = new Intl.DateTimeFormat("sr-Latn", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Podgorica" });

// "U izradi: Ana, 3. 11. 14:05" ili "Izmjena (Ana, 3. 11. 14:05): termin ..."
function historyText(entry) {
  const when = `${entry.byName}, ${timeFormat.format(entry.at)}`;
  return entry.action === "edit" ? `Izmjena (${when}): ${entry.summary}` : `${ORDER_STATUSES[entry.status]}: ${when}`;
}

export default function OrderCard({ order, backHref }) {
  const history = order.history ?? [];
  const lastChange = history.at(-1);
  const editable = EDITABLE_STATUSES.includes(order.status);

  return (
    <article className={`rounded-xl border border-l-4 border-line px-4 py-3 text-sm ${CARD_STYLES[order.status]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <strong className="text-base text-ink tabular-nums">{order.pickupTime}</strong>
          <span className="font-semibold text-ink">{order.customer.name}</span>
          <a href={`tel:${order.customer.phone.replace(/\s/g, "")}`} className="text-xs font-semibold text-primary">
            {order.customer.phone}
          </a>
          {order.customer.viber && <span className="text-[11px] text-primary">Viber</span>}
          {order.locale !== "me" && <span className="text-[11px] text-muted uppercase">{order.locale}</span>}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[order.status]}`}>
          {ORDER_STATUSES[order.status]}
        </span>
      </div>

      <ul className="mt-2 flex flex-col gap-1">
        {order.items.map((line, index) => {
          const { title, option, details, photos } = describeItem(line);
          return (
            <li key={index} className="flex justify-between gap-3">
              <span className="min-w-0">
                <strong>{line.quantity}×</strong> {title} <span className="text-muted">· {option}</span>
                {line.priceAgreed && <span className="ml-1 text-[11px] text-primary">dogovoreno</span>}
                {details.length > 0 && <span className="block text-xs text-muted">{details.join(" · ")}</span>}
                {photos.length > 0 && <OrderPhotos photos={photos} />}
              </span>
              <span className="whitespace-nowrap tabular-nums">
                {line.unitPrice === null ? <span className="text-muted">po dogovoru</span> : formatPrice(line.unitPrice * line.quantity)}
              </span>
            </li>
          );
        })}
      </ul>

      {order.note && <p className="mt-2 rounded-lg bg-blush/50 px-3 py-1.5 text-xs text-ink">Napomena: {order.note}</p>}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-2">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <strong className="text-ink">Ukupno {formatPrice(order.total)}</strong>
          {order.hasPhonePrice && <span className="text-xs text-muted">+ po dogovoru</span>}
          {history.length > 0 ? (
            <details className="text-[11px] text-muted">
              <summary className="cursor-pointer">{lastChange.action === "edit" ? "Izmijenjena" : ORDER_STATUSES[lastChange.status]}: {lastChange.byName} · istorija ({history.length})</summary>
              <ul className="mt-1 flex flex-col gap-0.5">
                <li>Poslata {timeFormat.format(order.createdAt)}</li>
                {history.map((entry, index) => (
                  <li key={index}>{historyText(entry)}</li>
                ))}
              </ul>
            </details>
          ) : (
            <span className="text-[11px] text-muted">Poslata {timeFormat.format(order.createdAt)}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {editable && (
            <Link
              href={`/admin/orders/${order._id}?back=${encodeURIComponent(backHref)}`}
              className="inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold text-muted transition-colors hover:bg-blush hover:text-primary"
            >
              Izmijeni
            </Link>
          )}
          <OrderActions orderId={order._id.toString()} status={order.status} />
        </div>
      </div>
    </article>
  );
}
