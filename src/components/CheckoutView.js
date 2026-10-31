"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Phone, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { eyebrow, fieldInput, linkBtn, section } from "@/components/styles";
import { formatPrice } from "@/lib/format";
import { pickupTimes, tomorrowISO } from "@/lib/date";

const PHONE = "+38268210652";
const PHONE_LABEL = "+382 68 210 652";

export default function CheckoutView() {
  const { items, total, hasPhonePrice, updateQuantity, removeItem, clear } = useCart();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [viber, setViber] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <section className={`${section} text-center`}>
        <div className="mx-auto max-w-xl rounded-2xl border border-line bg-card p-10">
          <p className={`${eyebrow} justify-center`}>Zahtjev poslat</p>
          <h1 className="mb-5 font-serif text-5xl text-ink">Hvala vam!</h1>
          <p className="leading-relaxed text-muted">
            Primili smo vaš zahtjev. Porudžbina nije potvrđena dok vas ne pozovemo. Javićemo vam se uskoro na{" "}
            <strong className="text-ink">{phone}</strong>.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/" className={linkBtn}>
              Nazad na početnu
            </Link>
            <a href={`tel:${PHONE}`} className="inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 text-sm font-semibold text-ink transition-colors hover:border-primary">
              <Phone className="size-4" /> Pozovite nas
            </a>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={section}>
        <p className={eyebrow}>Fantazija · Tuzi</p>
        <h1 className="mb-8 font-serif text-5xl leading-none tracking-tight text-ink md:text-6xl">Vaša porudžbina</h1>
        <div className="rounded-2xl border border-line bg-card p-8">
          <h2 className="font-serif text-3xl text-ink">Porudžbina je prazna</h2>
          <p className="mt-2 text-muted">Dodajte tortu ili kolače da biste nastavili.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/offer" className={linkBtn}>
              Pogledaj ponudu
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const canSubmit = name.trim() && phone.trim() && date && time;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    clear();
    setSent(true);
  };

  return (
    <section className={section}>
      <Link href="/offer" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-ink">
        <ArrowLeft className="size-4" /> Naruči još
      </Link>
      <p className={eyebrow}>Fantazija · Tuzi</p>
      <h1 className="mb-10 font-serif text-5xl leading-none tracking-tight text-ink md:text-6xl">Vaša porudžbina</h1>

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
                    {item.unitPrice !== undefined ? ` · ${formatPrice(item.unitPrice)}` : " · cijena po dogovoru"}
                  </p>
                  {item.summary && <p className="mt-1 text-xs text-muted">{item.summary}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Smanji količinu"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="grid size-7 place-items-center rounded-full border border-line hover:border-primary"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <strong className="w-6 text-center text-sm">{item.quantity}</strong>
                  <button
                    type="button"
                    aria-label="Povećaj količinu"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="grid size-7 place-items-center rounded-full border border-line hover:border-primary"
                  >
                    <Plus className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Ukloni"
                    onClick={() => removeItem(item.id)}
                    className="ml-2 grid size-7 place-items-center rounded-full text-primary hover:bg-blush"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <strong className="text-sm whitespace-nowrap text-primary">
                {item.unitPrice !== undefined ? formatPrice(item.unitPrice * item.quantity) : "Po dogovoru"}
              </strong>
            </article>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 self-start rounded-2xl border border-line bg-card p-6 md:p-7">
          <h2 className="font-serif text-3xl text-ink">Preuzimanje u Tuzima</h2>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
            Datum
            <input type="date" min={tomorrowISO()} value={date} onChange={(e) => setDate(e.target.value)} className={fieldInput} required />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
            Vrijeme
            <select value={time} onChange={(e) => setTime(e.target.value)} className={fieldInput} required>
              <option value="">Izaberite vrijeme</option>
              {pickupTimes.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
            Ime i prezime
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Milica Petrović" className={fieldInput} required />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
            Broj telefona
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+382 68 000 000" className={fieldInput} required />
          </label>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={viber} onChange={(e) => setViber(e.target.checked)} className="accent-primary" />
            Koristim Viber
          </label>

          <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
            <span>Ukupno</span>
            <strong className="font-serif text-2xl text-primary">{formatPrice(total)}</strong>
          </div>

          {hasPhonePrice && <p className="text-xs leading-relaxed text-muted">Cijena nekih stavki dogovara se telefonom.</p>}
          <p className="text-xs leading-relaxed text-muted">Vaša porudžbina nije potvrđena dok vas ne pozovemo.</p>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Pošalji zahtjev <Phone className="size-4" />
          </button>
          <p className="text-center text-xs text-muted">
            Ili nas pozovite na <a href={`tel:${PHONE}`} className="font-semibold text-primary">{PHONE_LABEL}</a>
          </p>
        </form>
      </div>
    </section>
  );
}
