"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { formatPrice } from "@/lib/format";

export default function OfferCard({ kind, product }) {
  const { addItem } = useCart();
  const [optionIndex, setOptionIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(timer);
  }, [added]);

  const option = product.options[optionIndex];
  const onRequest = option.price === null;
  const hasChoice = product.options.length > 1;

  const handleAdd = () => {
    addItem({
      id: `${kind}-${product.id}-${option.label}`,
      kind,
      name: product.name,
      image: product.image,
      option: option.label,
      quantity,
      unitPrice: onRequest ? undefined : option.price,
      phonePrice: onRequest,
    });
    setQuantity(1);
    setAdded(true);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-card">
      <img src={product.image} alt={product.name} className="aspect-4/3 w-full object-cover" />
      <div className="flex flex-1 flex-col gap-4 p-5">
        {product.badges && (
          <div className="flex flex-wrap gap-2">
            {product.badges.map((badge) => (
              <span key={badge} className="rounded-full bg-blush px-2.5 py-1 text-[10px] text-primary">
                {badge}
              </span>
            ))}
          </div>
        )}

        <div>
          <h3 className="font-serif text-2xl text-ink">{product.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">{product.desc}</p>
        </div>

        {hasChoice ? (
          <div className="flex flex-wrap gap-2">
            {product.options.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setOptionIndex(index)}
                aria-pressed={optionIndex === index}
                className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                  optionIndex === index
                    ? "border-primary bg-blush text-ink"
                    : "border-line text-muted hover:border-primary"
                }`}
              >
                <span className="block font-semibold">{item.label}</span>
                <span className="block text-[11px]">
                  {item.note ? `${item.note} · ` : ""}
                  {item.price === null ? "po dogovoru" : formatPrice(item.price)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            {option.label}
            {option.note ? ` · ${option.note}` : ""}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-4 border-t border-line pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Smanji količinu"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="grid size-8 place-items-center rounded-full border border-line text-ink transition-colors hover:border-primary"
              >
                <Minus className="size-3.5" />
              </button>
              <strong className="w-4 text-center text-sm">{quantity}</strong>
              <button
                type="button"
                aria-label="Povećaj količinu"
                onClick={() => setQuantity((current) => current + 1)}
                className="grid size-8 place-items-center rounded-full border border-line text-ink transition-colors hover:border-primary"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <strong className="text-sm text-primary">
              {onRequest ? "Cijena po dogovoru" : formatPrice(option.price * quantity)}
            </strong>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {added ? "Dodato u korpu" : "Dodaj u korpu"}
          </button>
        </div>
      </div>
    </article>
  );
}
