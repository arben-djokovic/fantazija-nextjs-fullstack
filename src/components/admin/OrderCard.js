import messages from "../../../messages/me.json";
import { OPTION_KEYS } from "@/data/items";
import { ORDER_STATUSES } from "@/data/orders";
import { formatPrice } from "@/lib/format";
import OrderActions from "@/components/admin/OrderActions";

const cakeText = messages.CakeBuilder;

const STATUS_STYLES = {
  new: "bg-primary text-white",
  confirmed: "bg-blush text-primary",
  ready: "bg-ink text-white",
  completed: "bg-line text-muted",
  cancelled: "bg-line text-muted line-through",
};

const timeFormat = new Intl.DateTimeFormat("sr-Latn", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Podgorica" });

// Naziv stavke, opcija i detalji custom torte, na crnogorskom.
function describeItem(line) {
  if (line.kind === "item") {
    return { title: line.name.me, option: OPTION_KEYS[line.optionKey], details: [] };
  }

  const cake = line.custom;
  const details = [
    cake.photo && "jestiva slika",
    cake.fasting && "posna",
    cake.glutenFree && "bez glutena",
    cake.inscription && `natpis „${cake.inscription}”`,
    cake.wishes && `želje: ${cake.wishes}`,
    cake.idea && `ideja: ${cake.idea}`,
  ].filter(Boolean);

  return {
    title: cake.cakeType === "special" ? cakeText.specialCake : cakeText.flavours[cake.flavour],
    option: cake.size ? `${cakeText.sizes[cake.size].label}, po želji` : "po želji",
    details,
  };
}

export default function OrderCard({ order }) {
  const lastChange = order.history?.at(-1);

  return (
    <article className={`rounded-xl border border-line bg-card px-4 py-3 text-sm ${order.status === "cancelled" ? "opacity-60" : ""}`}>
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
          const { title, option, details } = describeItem(line);
          return (
            <li key={index} className="flex justify-between gap-3">
              <span className="min-w-0">
                <strong>{line.quantity}×</strong> {title} <span className="text-muted">· {option}</span>
                {details.length > 0 && <span className="block text-xs text-muted">{details.join(" · ")}</span>}
              </span>
              <span className="whitespace-nowrap tabular-nums">
                {line.unitPrice === null ? <span className="text-muted">po dogovoru</span> : formatPrice(line.unitPrice * line.quantity)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-2">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <strong className="text-ink">Ukupno {formatPrice(order.total)}</strong>
          {order.hasPhonePrice && <span className="text-xs text-muted">+ po dogovoru</span>}
          <span className="text-[11px] text-muted">
            {lastChange
              ? `${ORDER_STATUSES[lastChange.status]}: ${lastChange.byName}, ${timeFormat.format(lastChange.at)}`
              : `Poslata ${timeFormat.format(order.createdAt)}`}
          </span>
        </div>
        <OrderActions orderId={order._id.toString()} status={order.status} />
      </div>
    </article>
  );
}
