"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { formatPrice } from "@/lib/format";

export default function OfferCard({ product, highlighted = false }) {
  const t = useTranslations();
  const locale = useLocale();
  const { addItem } = useCart();
  const [optionIndex, setOptionIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(timer);
  }, [added]);

  const { name, description } = product;
  const option = product.options[optionIndex];
  const onRequest = option.price === null;
  const hasChoice = product.options.length > 1;
  const optionLabel = t(`Products.options.${option.key}`);

  const handleAdd = () => {
    addItem({
      id: `${product.type}-${product.slug}-${option.key}`,
      kind: product.type,
      itemId: product.id,
      optionId: option.id,
      name,
      image: product.image,
      option: optionLabel,
      quantity,
      unitPrice: onRequest ? undefined : option.price,
      phonePrice: onRequest,
    });
    setQuantity(1);
    setAdded(true);
  };

  return (
    <article
      id={product.slug}
      className={`flex scroll-mt-28 flex-col overflow-hidden rounded-xl border bg-card transition-[border-color,box-shadow] duration-700 ${
        highlighted ? "border-primary ring-4 ring-primary/25" : "border-line"
      }`}
    >
      <img src={product.image} alt={name} className="aspect-4/3 w-full object-cover" />
      <div className="flex flex-1 flex-col gap-4 p-5">
        {product.badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.badges.map((badge) => (
              <span key={badge} className="rounded-full bg-blush px-2.5 py-1 text-[10px] text-primary">
                {t(`Products.badges.${badge}`)}
              </span>
            ))}
          </div>
        )}

        <div>
          <h3 className="font-serif text-2xl text-ink">{name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
        </div>

        {hasChoice ? (
          <div className="flex flex-wrap gap-2">
            {product.options.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOptionIndex(index)}
                aria-pressed={optionIndex === index}
                className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                  optionIndex === index
                    ? "border-primary bg-blush text-ink"
                    : "border-line text-muted hover:border-primary"
                }`}
              >
                <span className="block font-semibold">{t(`Products.options.${item.key}`)}</span>
                <span className="block text-[11px]">
                  {item.servings ? `${t("Products.servings", { count: item.servings })} · ` : ""}
                  {item.price === null ? t("Cart.optionOnRequest") : formatPrice(item.price, locale)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            {optionLabel}
            {option.servings ? ` · ${t("Products.servings", { count: option.servings })}` : ""}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-4 border-t border-line pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={t("Cart.decrease")}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="grid size-8 place-items-center rounded-full border border-line text-ink transition-colors hover:border-primary"
              >
                <Minus className="size-3.5" />
              </button>
              <strong className="w-4 text-center text-sm">{quantity}</strong>
              <button
                type="button"
                aria-label={t("Cart.increase")}
                onClick={() => setQuantity((current) => current + 1)}
                className="grid size-8 place-items-center rounded-full border border-line text-ink transition-colors hover:border-primary"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <strong className="text-sm text-primary">
              {onRequest ? t("Cart.priceOnRequest") : formatPrice(option.price * quantity, locale)}
            </strong>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition-[background-color,opacity] duration-300 hover:opacity-90 ${
              added ? "bg-emerald-600" : "bg-primary"
            }`}
          >
            {added ? t("Cart.added") : t("Cart.addToCart")}
          </button>
        </div>
      </div>
    </article>
  );
}
