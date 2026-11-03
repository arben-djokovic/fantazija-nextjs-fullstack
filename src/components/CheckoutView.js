"use client";

/* eslint-disable @next/next/no-img-element */
import { useLayoutEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Minus, Phone, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { eyebrow, fieldInput, linkBtn, section } from "@/components/styles";
import { formatPrice } from "@/lib/format";
import { pickupTimes, tomorrowISO } from "@/lib/date";
import { Link } from "@/i18n/navigation";

const PHONE = "+38268210652";
const PHONE_LABEL = "+382 68 210 652";

export default function CheckoutView() {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const { items, total, hasPhonePrice, updateQuantity, removeItem, clear } = useCart();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [viber, setViber] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentPhone, setSentPhone] = useState("");

  // Next čuva stranicu sakrivenu nakon navigacije (Activity), pa bi se "Hvala" ekran vratio sa sljedećom korpom.
  // Kad se stranica sakrije, poruka se gasi, a korpa je ionako već prazna.
  useLayoutEffect(() => () => setSent(false), []);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  if (sent) {
    return (
      <section className={`${section} text-center`}>
        <div className="mx-auto max-w-xl rounded-2xl border border-line bg-card p-10">
          <p className={`${eyebrow} justify-center`}>{t("sentEyebrow")}</p>
          <h1 className="mb-5 font-serif text-5xl text-ink">{t("sentTitle")}</h1>
          <p className="leading-relaxed text-muted">{t("sentText", { phone: sentPhone })}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/" className={linkBtn}>
              {t("backHome")}
            </Link>
            <a href={`tel:${PHONE}`} className="inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 text-sm font-semibold text-ink transition-colors hover:border-primary">
              <Phone className="size-4" /> {t("callUs")}
            </a>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={section}>
        <p className={eyebrow}>{t("eyebrowText")}</p>
        <h1 className="mb-8 font-serif text-5xl leading-none tracking-tight text-ink md:text-6xl">{t("title")}</h1>
        <div className="rounded-2xl border border-line bg-card p-8">
          <h2 className="font-serif text-3xl text-ink">{t("emptyTitle")}</h2>
          <p className="mt-2 text-muted">{t("emptyText")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/offer" className={linkBtn}>
              {t("viewOffer")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const canSubmit = name.trim() && phone.trim() && date && time;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || sending) return;
    setSending(true);
    setError("");

    // Šalju se samo ID-jevi i izbori; naziv i cijenu server uzima iz baze, odnosno računa sam.
    const orderItems = items.map((item) =>
      item.custom
        ? { kind: "custom", quantity: item.quantity, custom: item.custom }
        : { kind: "item", itemId: item.itemId, optionId: item.optionId, quantity: item.quantity },
    );

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone, viber },
          pickupDate: date,
          pickupTime: time,
          locale,
          items: orderItems,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.code === "ITEM_UNAVAILABLE" ? t("errorUnavailable") : t("errorGeneric"));
        return;
      }

      // Sljedeća narudžba počinje od prazne forme (stranica ostaje sačuvana nakon navigacije).
      setSentPhone(phone);
      clear();
      setDate("");
      setTime("");
      setName("");
      setPhone("");
      setViber(false);
      setSent(true);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={section}>
      <Link href="/offer" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-ink">
        <ArrowLeft className="size-4" /> {t("backToOffer")}
      </Link>
      <p className={eyebrow}>{t("eyebrowText")}</p>
      <h1 className="mb-10 font-serif text-5xl leading-none tracking-tight text-ink md:text-6xl">{t("title")}</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <article key={item.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-4 rounded-xl border border-line bg-card p-3 md:grid-cols-[88px_1fr_auto] md:gap-5 md:p-4">
              {item.image && <img src={item.image} alt={item.name} className="size-18 rounded-lg object-cover md:size-22" />}
              <div className="flex flex-col gap-2">
                <div>
                  <h2 className="font-serif text-xl text-ink">{item.name}</h2>
                  <p className="text-xs text-muted">
                    {item.option}
                    {item.unitPrice !== undefined
                      ? ` · ${formatPrice(item.unitPrice, locale)}`
                      : ` · ${t("priceOnRequestLine")}`}
                  </p>
                  {item.summary && <p className="mt-1 text-xs text-muted">{item.summary}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={t("decrease")}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="grid size-7 place-items-center rounded-full border border-line hover:border-primary"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <strong className="w-6 text-center text-sm">{item.quantity}</strong>
                  <button
                    type="button"
                    aria-label={t("increase")}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="grid size-7 place-items-center rounded-full border border-line hover:border-primary"
                  >
                    <Plus className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={t("remove")}
                    onClick={() => removeItem(item.id)}
                    className="ml-2 grid size-7 place-items-center rounded-full text-primary hover:bg-blush"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <strong className="text-sm whitespace-nowrap text-primary">
                {item.unitPrice !== undefined ? formatPrice(item.unitPrice * item.quantity, locale) : t("onRequestShort")}
              </strong>
            </article>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 self-start rounded-2xl border border-line bg-card p-6 md:p-7">
          <h2 className="font-serif text-3xl text-ink">{t("pickupTitle")}</h2>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
            {t("date")}
            <input type="date" min={tomorrowISO()} value={date} onChange={(e) => setDate(e.target.value)} className={fieldInput} required />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
            {t("time")}
            <select value={time} onChange={(e) => setTime(e.target.value)} className={fieldInput} required>
              <option value="">{t("chooseTime")}</option>
              {pickupTimes.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
            {t("name")}
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} className={fieldInput} required />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
            {t("phone")}
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("phonePlaceholder")} className={fieldInput} required />
          </label>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={viber} onChange={(e) => setViber(e.target.checked)} className="accent-primary" />
            {t("viber")}
          </label>

          <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
            <span>{t("total")}</span>
            <strong className="font-serif text-2xl text-primary">{formatPrice(total, locale)}</strong>
          </div>

          {hasPhonePrice && <p className="text-xs leading-relaxed text-muted">{t("phoneNote")}</p>}
          <p className="text-xs leading-relaxed text-muted">{t("notConfirmed")}</p>

          <button
            type="submit"
            disabled={!canSubmit || sending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? t("sending") : t("submit")}
          </button>
          {error && (
            <p role="alert" className="text-center text-xs leading-relaxed text-primary">
              {error}
            </p>
          )}
          <p className="text-center text-xs text-muted">
            {t("orCall")} <a href={`tel:${PHONE}`} className="font-semibold text-primary">{PHONE_LABEL}</a>
          </p>
        </form>
      </div>
    </section>
  );
}
