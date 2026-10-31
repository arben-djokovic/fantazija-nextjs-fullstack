"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Heart, Phone, Upload } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { eyebrow, fieldInput, linkBtn, section } from "@/components/styles";
import { formatPrice } from "@/lib/format";
import { pickupTimes, tomorrowISO } from "@/lib/date";

const STEPS = ["Tip torte", "Ukus", "Dekoracija", "Preuzimanje", "Vaši podaci"];

const CAKE_TYPES = {
  classic: { label: "Klasične torte", hint: "Provjereni ukusi za svaku priliku.", note: "od 15 €", icon: "01" },
  premium: { label: "Premium torte", hint: "Bogati ukusi i posebni sastojci.", note: "27 €", icon: "02" },
  special: { label: "Specijalne torte", hint: "Vjenčane, spratne i torte po vašoj zamisli.", note: "po dogovoru", icon: "03" },
};

// Gradijenti služe kao uzorci ukusa dok nemamo fotografije.
const SWATCHES = [
  "from-[#e9b5a4] to-[#6a271c]",
  "from-[#f2dbd5] to-[#b72f5d]",
  "from-[#d9b394] to-[#65351f]",
  "from-[#eee1c7] to-[#d5a06c]",
];

const FLAVOURS = {
  classic: ["Čokoladna torta", "Voćna torta", "Plazma torta", "Kinder torta"],
  premium: ["Rafaelo", "Ferrero", "Pistachio dream", "Red velvet"],
};

const SIZE_PRICES = {
  small: { label: "Mala", people: "oko 15 osoba", price: 15 },
  large: { label: "Velika", people: "oko 20 osoba", price: 20 },
};

const PREMIUM_PRICE = 27;
const PHOTO_EXTRA = 5;

const cardBase = "flex flex-col items-start rounded-xl border border-line bg-cream p-4 text-left transition-colors hover:border-primary md:p-5";
const selectedRing = "border-primary ring-2 ring-blush";
const checkboxLabel = "flex items-start gap-2 text-xs text-ink";

function StepBadge({ index, step }) {
  const done = step > index + 1;
  const active = step === index + 1;
  return (
    <span
      className={`grid size-7 flex-none place-items-center rounded-full border text-[10px] ${
        active || done ? "border-primary text-primary" : "border-line text-muted/70"
      }`}
    >
      {done ? <Check className="size-3.5" /> : index + 1}
    </span>
  );
}

function FileDrop({ label, files, onFiles, optional }) {
  return (
    <label className="relative mb-5 flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-primary/40 bg-blush/40 text-xs text-primary">
      <span className="flex items-center gap-2 font-semibold">
        <Upload className="size-4" /> {label}
        {optional && <small className="font-normal text-muted">(opciono)</small>}
      </span>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => onFiles(event.target.files)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      {files.length > 0 && <span className="text-[11px] text-muted">{files.join(", ")}</span>}
    </label>
  );
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="mb-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-cream p-4">
      <span className="flex flex-col gap-1">
        <strong className="text-sm text-ink">{label}</strong>
        <small className="text-xs text-muted">{hint}</small>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span className="relative h-6 w-10 flex-none rounded-full bg-line transition-colors peer-checked:bg-primary after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
    </label>
  );
}

export default function CakeBuilder() {
  const { addItem } = useCart();
  const [step, setStep] = useState(1);
  const [cakeType, setCakeType] = useState("classic");
  const [flavour, setFlavour] = useState(FLAVOURS.classic[0]);
  const [size, setSize] = useState("small");
  const [photo, setPhoto] = useState(false);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [inscription, setInscription] = useState("");
  const [wishes, setWishes] = useState("");
  const [idea, setIdea] = useState("");
  const [fasting, setFasting] = useState(false);
  const [gluten, setGluten] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [viber, setViber] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const basePrice =
    cakeType === "classic" ? SIZE_PRICES[size].price : cakeType === "premium" ? PREMIUM_PRICE : null;
  const total = basePrice === null ? null : basePrice + (photo ? PHOTO_EXTRA : 0);
  // Posebni zahtjevi i specijalne torte se ne mogu odmah cijeniti, pa cijenu dogovaramo telefonom.
  const phonePricing = cakeType === "special" || wishes.trim().length > 0;
  const cakeName = cakeType === "special" ? "Specijalna torta" : flavour;
  const optionLabel = cakeType === "classic" ? SIZE_PRICES[size].label : CAKE_TYPES[cakeType].label;

  const selectType = (type) => {
    setCakeType(type);
    setFlavour(type === "special" ? "" : FLAVOURS[type][0]);
  };

  const addFiles = (incoming) => {
    if (incoming) setPhotoFiles(Array.from(incoming).map((file) => file.name));
  };

  const handleAdd = () => {
    addItem({
      id: `cake-custom-${Date.now()}`,
      kind: "cake",
      name: cakeName,
      option: optionLabel,
      quantity: 1,
      unitPrice: total ?? undefined,
      phonePrice: phonePricing,
      summary: [wishes.trim(), inscription.trim() && `Natpis: ${inscription.trim()}`].filter(Boolean).join(" · ") || undefined,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className={`${section} text-center`}>
        <div className="mx-auto max-w-xl rounded-2xl border border-line bg-card p-10">
          <div className="mx-auto mb-7 grid size-22 place-items-center rounded-full bg-blush text-primary">
            <Heart className="size-9" fill="currentColor" />
          </div>
          <p className={`${eyebrow} justify-center`}>Fantazija · Tuzi</p>
          <h1 className="mb-5 font-serif text-5xl text-ink">Hvala vam!</h1>
          <p className="leading-relaxed text-muted">
            Vaša torta je dodata u korpu. Porudžbina nije potvrđena dok vas ne pozovemo.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/order/checkout" className={linkBtn}>
              Pogledaj korpu
            </Link>
            <a href="tel:+38268210652" className="inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 text-sm font-semibold text-ink transition-colors hover:border-primary">
              <Phone className="size-4" /> Pozovite nas
            </a>
          </div>
        </div>
      </section>
    );
  }

  const next = () => setStep((current) => Math.min(current + 1, STEPS.length));
  const previous = () => setStep((current) => Math.max(current - 1, 1));

  return (
    <section className={section}>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
        <div>
          <Link href="/offer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-ink">
            <ArrowLeft className="size-4" /> Nazad na ponudu
          </Link>

          <div className="mt-12 mb-10">
            <p className={eyebrow}>Slatki trenutak po vašoj želji</p>
            <h1 className="mb-4 font-serif text-5xl leading-none tracking-tight text-ink md:text-6xl">Napravi svoju tortu</h1>
            <p className="max-w-xl leading-relaxed text-muted">Izaberite ukus, veličinu, dekoraciju i detalje korak po korak.</p>
          </div>

          <ol className="mb-8 flex items-center">
            {STEPS.map((label, index) => (
              <li key={label} className={`flex items-center gap-2 ${index < STEPS.length - 1 ? "flex-1" : ""} ${step >= index + 1 ? "text-primary" : "text-muted/70"}`}>
                <StepBadge index={index} step={step} />
                <span className="hidden text-[11px] whitespace-nowrap md:inline">{label}</span>
                {index < STEPS.length - 1 && <span className="mx-2 hidden h-px flex-1 bg-line md:block" />}
              </li>
            ))}
          </ol>

          <div className="flex min-h-[460px] flex-col rounded-2xl border border-line bg-card p-6 md:p-8">
            {step === 1 && (
              <>
                <h2 className="mb-6 font-serif text-3xl text-ink">{STEPS[0]}</h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {Object.entries(CAKE_TYPES).map(([type, info]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => selectType(type)}
                      className={`${cardBase} md:min-h-52 ${cakeType === type ? selectedRing : ""}`}
                    >
                      <span className="mb-2 font-serif text-xl text-primary italic md:mb-6 md:text-2xl">{info.icon}</span>
                      <strong className="font-serif text-lg text-ink md:text-xl">{info.label}</strong>
                      <p className="mt-1 mb-3 text-xs leading-relaxed text-muted md:mt-2 md:mb-4">{info.hint}</p>
                      <em className="mt-auto text-xs text-primary not-italic">{info.note}</em>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {cakeType === "special" ? (
                  <>
                    <h2 className="mb-6 font-serif text-3xl text-ink">Opišite vašu ideju</h2>
                    <label className="mb-5 flex flex-col gap-2 text-xs font-semibold text-ink">
                      Vaša ideja
                      <textarea
                        value={idea}
                        onChange={(event) => setIdea(event.target.value)}
                        placeholder="Broj spratova, približan broj gostiju, stil..."
                        className={`${fieldInput} min-h-28 resize-y`}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <h2 className="mb-6 font-serif text-3xl text-ink">Izaberite ukus</h2>
                    <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2">
                      {FLAVOURS[cakeType].map((item, index) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setFlavour(item)}
                          className={`flex items-center gap-4 rounded-xl border border-line bg-cream p-2.5 text-left transition-colors hover:border-primary ${
                            flavour === item ? selectedRing : ""
                          }`}
                        >
                          <span className={`h-16 w-18 flex-none rounded-lg bg-linear-to-br ${SWATCHES[index]}`} />
                          <strong className="flex-1 font-serif text-base text-ink">{item}</strong>
                          <Check className={`size-4 text-primary ${flavour === item ? "opacity-100" : "opacity-0"}`} />
                        </button>
                      ))}
                    </div>

                    {cakeType === "classic" && (
                      <>
                        <h3 className="mb-3 font-serif text-lg text-ink">Veličina</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {Object.entries(SIZE_PRICES).map(([key, info]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSize(key)}
                              className={`${cardBase} gap-1 ${size === key ? selectedRing : ""}`}
                            >
                              <strong className="font-serif text-lg text-ink">{info.label}</strong>
                              <span className="text-xs text-muted">
                                {info.people} · {info.price} €
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="mb-6 font-serif text-3xl text-ink">Dekoracija i detalji</h2>
                <Toggle
                  label="Fotografija na torti"
                  hint={`Dodajte fotografiju koju želite na torti (+${PHOTO_EXTRA} €)`}
                  checked={photo}
                  onChange={setPhoto}
                />
                {photo && <FileDrop label="Dodajte fotografiju" files={photoFiles} onFiles={addFiles} />}

                <label className="mb-5 flex flex-col gap-2 text-xs font-semibold text-ink">
                  Natpis na torti <small className="font-normal text-muted">(opciono)</small>
                  <input value={inscription} onChange={(event) => setInscription(event.target.value)} placeholder="Po želji" className={fieldInput} />
                </label>

                <label className="mb-5 flex flex-col gap-2 text-xs font-semibold text-ink">
                  Želje za dekoraciju <small className="font-normal text-muted">(opciono)</small>
                  <textarea
                    value={wishes}
                    onChange={(event) => setWishes(event.target.value)}
                    placeholder="Boje, tema, figurice..."
                    className={`${fieldInput} min-h-24 resize-y`}
                  />
                </label>

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:gap-8">
                  <label className={checkboxLabel}>
                    <input type="checkbox" checked={fasting} onChange={(event) => setFasting(event.target.checked)} className="mt-0.5 accent-primary" />
                    <span>
                      Posna torta <small className="block text-[10px] text-muted">(dostupno na zahtjev)</small>
                    </span>
                  </label>
                  <label className={checkboxLabel}>
                    <input type="checkbox" checked={gluten} onChange={(event) => setGluten(event.target.checked)} className="mt-0.5 accent-primary" />
                    <span>
                      Bez glutena <small className="block text-[10px] text-muted">(dostupno na zahtjev)</small>
                    </span>
                  </label>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="mb-6 font-serif text-3xl text-ink">Preuzimanje</h2>
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-xs font-semibold text-ink">
                    Datum preuzimanja
                    <input type="date" min={tomorrowISO()} value={date} onChange={(event) => setDate(event.target.value)} className={fieldInput} />
                  </label>
                  <label className="flex flex-col gap-2 text-xs font-semibold text-ink">
                    Vrijeme
                    <select value={time} onChange={(event) => setTime(event.target.value)} className={fieldInput}>
                      <option value="">09:00 – 22:00</option>
                      {pickupTimes.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-blush p-4 text-xs text-muted">
                  <Heart className="size-4 flex-none text-primary" fill="currentColor" />
                  Preuzimanje je moguće samo u našoj radnji u Tuzima.
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <h2 className="mb-6 font-serif text-3xl text-ink">Vaši podaci</h2>
                <label className="mb-5 flex flex-col gap-2 text-xs font-semibold text-ink">
                  Ime i prezime
                  <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Milica Petrović" className={fieldInput} required />
                </label>
                <label className="mb-5 flex flex-col gap-2 text-xs font-semibold text-ink">
                  Broj telefona
                  <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+382 68 000 000" className={fieldInput} required />
                </label>
                <label className={`${checkboxLabel} mb-6`}>
                  <input type="checkbox" checked={viber} onChange={(event) => setViber(event.target.checked)} className="mt-0.5 accent-primary" />
                  Koristim Viber na ovom broju
                </label>
                <div className="flex flex-col gap-1.5 border-t border-line pt-5 text-xs">
                  <strong className="text-ink">Svaka porudžbina mora biti potvrđena telefonom.</strong>
                  <span className="text-muted">Konačna cijena se potvrđuje kada vas pozovemo.</span>
                </div>
              </>
            )}

            <div className="mt-auto flex items-center gap-3 border-t border-line pt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={previous}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold text-ink transition-colors hover:border-primary"
                >
                  <ChevronLeft className="size-4" /> Nazad
                </button>
              )}
              {step < STEPS.length ? (
                <button
                  type="button"
                  onClick={next}
                  className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Nastavi <ChevronRight className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!name.trim() || !phone.trim()}
                  className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Dodaj tortu u korpu <ArrowRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="self-start rounded-2xl bg-ink p-6 text-white lg:sticky lg:top-24">
          <p className="mb-4 text-xs font-semibold tracking-widest text-blush uppercase">Pregled porudžbine</p>
          <h3 className="mb-6 font-serif text-2xl">{cakeName || CAKE_TYPES[cakeType].label}</h3>

          <div className="flex justify-between gap-3 border-b border-white/15 py-3 text-xs text-white/70">
            <span>{CAKE_TYPES[cakeType].label}</span>
            <strong className="font-medium text-white">{basePrice === null ? "po dogovoru" : formatPrice(basePrice)}</strong>
          </div>
          {cakeType === "classic" && (
            <div className="flex justify-between gap-3 border-b border-white/15 py-3 text-xs text-white/70">
              <span>{SIZE_PRICES[size].label}</span>
              <span>{SIZE_PRICES[size].people}</span>
            </div>
          )}
          {photo && (
            <div className="flex justify-between gap-3 border-b border-white/15 py-3 text-xs text-white/70">
              <span>Fotografija</span>
              <strong className="font-medium text-white">+{PHOTO_EXTRA} €</strong>
            </div>
          )}

          <div className="flex items-end justify-between gap-3 pt-5 text-xs">
            <span>{phonePricing ? "Cijena se dogovara telefonom" : "Procijenjena cijena"}</span>
            <strong className="font-serif text-2xl text-blush">{phonePricing || total === null ? "—" : formatPrice(total)}</strong>
          </div>
          <p className="mt-5 text-[11px] leading-relaxed text-white/50">Konačna cijena se potvrđuje kada vas pozovemo.</p>
        </aside>
      </div>
    </section>
  );
}
