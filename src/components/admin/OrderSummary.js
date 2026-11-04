import { getFlavourItemIds, summarizeOrders } from "@/lib/adminOrders";
import OrderPhotos from "@/components/admin/OrderPhotos";

// Zbir proizvoda za izabrane narudžbe (npr. "U izradi" za danas): koliko čega treba ili je napravljeno.
export default async function OrderSummary({ orders, showDate }) {
  const { products, customCakes } = summarizeOrders(orders, await getFlavourItemIds());

  if (products.length === 0 && customCakes.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-card px-4 py-3 text-sm">
      {products.length > 0 && (
        <ul className="flex flex-col divide-y divide-line">
          {products.map((product) => (
            <li key={`${product.title}-${product.option}`} className="flex items-baseline justify-between gap-3 py-1.5">
              <span>
                <strong className="text-ink">{product.title}</strong> <span className="text-muted">· {product.option}</span>
              </span>
              <span className="flex items-baseline gap-2 whitespace-nowrap">
                {product.custom > 0 && <span className="text-xs text-primary">{product.custom === product.quantity ? "po želji" : `${product.custom} po želji`}</span>}
                <strong className="text-base text-ink tabular-nums">{product.quantity}×</strong>
              </span>
            </li>
          ))}
        </ul>
      )}

      {customCakes.length > 0 && (
        <div>
          <h3 className="mb-1 text-xs font-semibold tracking-wider text-muted uppercase">Torte po želji · {customCakes.length}</h3>
          <ul className="flex flex-col divide-y divide-line">
            {customCakes.map((cake, index) => (
              <li key={index} className="py-1.5">
                <span className="text-muted tabular-nums">
                  {showDate && `${Number(cake.date.slice(8, 10))}. ${Number(cake.date.slice(5, 7))}. `}
                  {cake.time}
                </span>{" "}
                {cake.quantity > 1 && <strong>{cake.quantity}× </strong>}
                <strong className="text-ink">{cake.title}</strong> <span className="text-muted">· {cake.option}</span>
                {cake.details.length > 0 && <span className="block text-xs text-muted">{cake.details.join(" · ")}</span>}
                {cake.photos.length > 0 && <OrderPhotos photos={cake.photos} />}
                <span className="block text-xs text-muted">za: {cake.customer}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
