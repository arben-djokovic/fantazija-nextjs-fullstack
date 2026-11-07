"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, LoaderCircle, Upload, X } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { eyebrow, fieldInput, page } from "@/components/styles";
import { formatPrice } from "@/lib/format";
import { canOptimize } from "@/lib/images";
import { Link, useRouter } from "@/i18n/navigation";
import { MAX_CAKE_PHOTOS, PHOTO_EXTRA, customCakePrice, needsPhonePricing } from "@/data/cakeBuilder";

// Termin preuzimanja i podatke kupca unosi checkout, pa se torta ovdje samo sastavi i doda u korpu.
// Ukusi su torte iz ponude (baza), a veličine njihove opcije, pa se veličine mijenjaju sa ukusom.
const STEP_KEYS = ["flavour", "decoration"];

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

// Slike se šalju na server čim ih kupac izabere, a u korpu ide samo njihov link.
function PhotoUpload({ t, photos, uploading, error, onFiles, onRemove }) {
  const full = photos.length >= MAX_CAKE_PHOTOS;
  return (
    <div className="mb-5 flex flex-col gap-3">
      {!full && (
        <label className="relative flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-primary/40 bg-blush/40 text-xs text-primary">
          <span className="flex items-center gap-2 font-semibold">
            {uploading ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {uploading ? t("photoUploading") : t("addPhoto")}
          </span>
          <span className="text-[11px] text-muted">{t("photoLimit", { count: MAX_CAKE_PHOTOS })}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            multiple
            disabled={uploading}
            onChange={(event) => {
              onFiles(event.target.files);
              event.target.value = "";
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      )}
      {error && <p className="text-xs text-primary">{error}</p>}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((url) => (
            <div key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="size-20 rounded-lg border border-line object-cover" />
              <button
                type="button"
                aria-label={t("removePhoto")}
                onClick={() => onRemove(url)}
                className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-ink text-white hover:bg-primary"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
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

// Najniža poznata cijena torte, za "od 15 €" na kartici ukusa. null kad su sve opcije po dogovoru.
function lowestPrice(cake) {
  const prices = cake.options.map((option) => option.price).filter((price) => price !== null);
  return prices.length > 0 ? Math.min(...prices) : null;
}

export default function CakeBuilder({ cakes }) {
  const t = useTranslations("CakeBuilder");
  const tProducts = useTranslations("Products");
  const locale = useLocale();
  const router = useRouter();
  const { addItem } = useCart();
  const [step, setStep] = useState(1);
  const [cakeId, setCakeId] = useState(cakes[0]?.id);
  const [optionId, setOptionId] = useState(cakes[0]?.options[0]?.id);
  const [photo, setPhoto] = useState(false);
  const [photos, setPhotos] = useState([]); // linkovi poslatih slika
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [inscription, setInscription] = useState("");
  const [wishes, setWishes] = useState("");
  const [fasting, setFasting] = useState(false);
  const [gluten, setGluten] = useState(false);
  const addedRef = useRef(false);

  // Next čuva stranicu sakrivenu nakon navigacije (Activity). Ako je torta dodata, builder se vraća na početak
  // tek kad se stranica sakrije, da se prije prelaska na korpu ne vidi prazan prvi korak.
  useLayoutEffect(
    () => () => {
      if (!addedRef.current) return;
      addedRef.current = false;
      setStep(1);
      setCakeId(cakes[0]?.id);
      setOptionId(cakes[0]?.options[0]?.id);
      setPhoto(false);
      setPhotos([]);
      setPhotoError("");
      setInscription("");
      setWishes("");
      setFasting(false);
      setGluten(false);
    },
    [cakes],
  );

  const cake = cakes.find((entry) => entry.id === cakeId) ?? cakes[0];
  const option = cake?.options.find((entry) => entry.id === optionId) ?? cake?.options[0];
  const money = (value) => formatPrice(value, locale);

  if (!cake || !option) {
    return (
      <section className={page}>
        <Link href="/offer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-ink">
          <ArrowLeft className="size-4" /> {t("backToOffer")}
        </Link>
        <h1 className="mt-8 mb-4 font-serif text-5xl leading-none tracking-tight text-ink md:text-6xl">{t("title")}</h1>
        <p className="text-muted">{t("noCakes")}</p>
      </section>
    );
  }

  const total = customCakePrice(option.price, photo);
  const phonePricing = total === null || needsPhonePricing({ wishes });
  const optionLabel = tProducts(`options.${option.key}`);
  const servings = (entry) => (entry.servings ? tProducts("servings", { count: entry.servings }) : "");

  // Kod promjene ukusa ostaje ista veličina ako je nova torta ima (npr. "Velika"), inače prva.
  const selectCake = (next) => {
    setCakeId(next.id);
    setOptionId((next.options.find((entry) => entry.key === option.key) ?? next.options[0]).id);
  };

  const addFiles = async (incoming) => {
    const files = Array.from(incoming ?? []).slice(0, MAX_CAKE_PHOTOS - photos.length);
    if (files.length === 0) return;
    setUploading(true);
    setPhotoError("");
    for (const file of files) {
      try {
        const data = new FormData();
        data.append("file", file);
        const response = await fetch("/api/uploads", { method: "POST", body: data });
        const result = await response.json().catch(() => ({}));
        if (response.ok) {
          setPhotos((current) => (current.length < MAX_CAKE_PHOTOS ? [...current, result.url] : current));
        } else {
          // Loš fajl (format, veličina) ili greška na serveru, da kupac zna da li treba druga slika.
          setPhotoError(t(response.status === 400 ? "photoError" : "photoServerError"));
        }
      } catch {
        setPhotoError(t("photoServerError"));
      }
    }
    setUploading(false);
  };

  const handleAdd = () => {
    addItem({
      id: `cake-custom-${Date.now()}`,
      kind: "cake",
      name: cake.name,
      option: optionLabel,
      image: photo && photos[0] ? photos[0] : cake.image, // prva slika kupca se vidi u korpi, inače slika torte
      quantity: 1,
      unitPrice: total ?? undefined,
      phonePrice: phonePricing,
      // Izbori idu serveru, koji sam provjerava tortu i veličinu u bazi i računa cijenu.
      custom: {
        itemId: cake.id,
        optionId: option.id,
        photo,
        photos: photo ? photos : [],
        inscription: inscription.trim() || undefined,
        wishes: wishes.trim() || undefined,
        fasting,
        glutenFree: gluten,
      },
      summary:
        [
          wishes.trim(),
          inscription.trim() && `${t("inscription")}: ${inscription.trim()}`,
          fasting && t("fasting"),
          gluten && t("gluten"),
        ]
          .filter(Boolean)
          .join(" · ") || undefined,
    });
    addedRef.current = true;
    router.push("/order/checkout");
  };

  const next = () => setStep((current) => Math.min(current + 1, STEP_KEYS.length));
  const previous = () => setStep((current) => Math.max(current - 1, 1));

  return (
    <section className={page}>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
        <div>
          <Link href="/offer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-ink">
            <ArrowLeft className="size-4" /> {t("backToOffer")}
          </Link>

          <div className="mt-8 mb-10">
            <p className={eyebrow}>{t("eyebrow")}</p>
            <h1 className="mb-4 font-serif text-5xl leading-none tracking-tight text-ink md:text-6xl">{t("title")}</h1>
            <p className="max-w-xl leading-relaxed text-muted">{t("intro")}</p>
          </div>

          <ol className="mb-8 flex items-center">
            {STEP_KEYS.map((key, index) => (
              <li key={key} className={`flex items-center gap-2 ${index < STEP_KEYS.length - 1 ? "flex-1" : ""} ${step >= index + 1 ? "text-primary" : "text-muted/70"}`}>
                <StepBadge index={index} step={step} />
                <span className="text-[11px] whitespace-nowrap">{t(`steps.${key}`)}</span>
                {index < STEP_KEYS.length - 1 && <span className="mx-2 h-px flex-1 bg-line" />}
              </li>
            ))}
          </ol>

          <div className="flex min-h-[460px] flex-col rounded-2xl border border-line bg-card p-6 md:p-8">
            {step === 1 && (
              <>
                <h2 className="mb-6 font-serif text-3xl text-ink">{t("chooseFlavour")}</h2>
                <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {cakes.map((entry) => {
                    const from = lowestPrice(entry);
                    const selected = entry.id === cake.id;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => selectCake(entry)}
                        className={`flex items-center gap-4 rounded-xl border border-line bg-cream p-2.5 text-left transition-colors hover:border-primary ${
                          selected ? selectedRing : ""
                        }`}
                      >
                        <Image
                          src={entry.image}
                          alt=""
                          width={72}
                          height={64}
                          unoptimized={!canOptimize(entry.image)}
                          className="h-16 w-18 flex-none rounded-lg object-cover"
                        />
                        <span className="flex flex-1 flex-col gap-1">
                          <strong className="font-serif text-base text-ink">{entry.name}</strong>
                          <span className="text-xs text-primary">
                            {from === null
                              ? t("onRequest")
                              : entry.options.length > 1
                                ? t("priceFrom", { price: money(from) })
                                : money(from)}
                          </span>
                        </span>
                        <Check className={`size-4 flex-none text-primary ${selected ? "opacity-100" : "opacity-0"}`} />
                      </button>
                    );
                  })}
                </div>

                <h3 className="mb-3 font-serif text-lg text-ink">{t("size")}</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {cake.options.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setOptionId(entry.id)}
                      className={`${cardBase} gap-1 ${entry.id === option.id ? selectedRing : ""}`}
                    >
                      <strong className="font-serif text-lg text-ink">{tProducts(`options.${entry.key}`)}</strong>
                      <span className="text-xs text-muted">
                        {servings(entry) && `${servings(entry)} · `}
                        {entry.price === null ? t("onRequest") : money(entry.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="mb-6 font-serif text-3xl text-ink">{t("decorationTitle")}</h2>
                <Toggle
                  label={t("photoLabel")}
                  hint={t("photoHint", { price: money(PHOTO_EXTRA) })}
                  checked={photo}
                  onChange={setPhoto}
                />
                {photo && (
                  <PhotoUpload
                    t={t}
                    photos={photos}
                    uploading={uploading}
                    error={photoError}
                    onFiles={addFiles}
                    onRemove={(url) => setPhotos((current) => current.filter((entry) => entry !== url))}
                  />
                )}

                <label className="mb-5 flex flex-col gap-2 text-xs font-semibold text-ink">
                  {t("inscription")} <small className="font-normal text-muted">{t("optional")}</small>
                  <input value={inscription} onChange={(event) => setInscription(event.target.value)} placeholder={t("inscriptionPlaceholder")} className={fieldInput} />
                </label>

                <label className="mb-5 flex flex-col gap-2 text-xs font-semibold text-ink">
                  {t("wishes")} <small className="font-normal text-muted">{t("optional")}</small>
                  <textarea
                    value={wishes}
                    onChange={(event) => setWishes(event.target.value)}
                    placeholder={t("wishesPlaceholder")}
                    className={`${fieldInput} min-h-24 resize-y`}
                  />
                </label>

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:gap-8">
                  <label className={checkboxLabel}>
                    <input type="checkbox" checked={fasting} onChange={(event) => setFasting(event.target.checked)} className="mt-0.5 accent-primary" />
                    <span>
                      {t("fasting")} <small className="block text-[10px] text-muted">{t("onRequestAvailable")}</small>
                    </span>
                  </label>
                  <label className={checkboxLabel}>
                    <input type="checkbox" checked={gluten} onChange={(event) => setGluten(event.target.checked)} className="mt-0.5 accent-primary" />
                    <span>
                      {t("gluten")} <small className="block text-[10px] text-muted">{t("onRequestAvailable")}</small>
                    </span>
                  </label>
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
                  <ChevronLeft className="size-4" /> {t("back")}
                </button>
              )}
              {step < STEP_KEYS.length ? (
                <button
                  type="button"
                  onClick={next}
                  className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {t("next")} <ChevronRight className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={uploading}
                  className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {t("addToCart")} <ArrowRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="self-start rounded-2xl bg-ink p-6 text-white lg:sticky lg:top-24">
          <p className="mb-4 text-xs font-semibold tracking-widest text-blush uppercase">{t("summaryTitle")}</p>
          <h3 className="mb-6 font-serif text-2xl">{cake.name}</h3>

          <div className="flex justify-between gap-3 border-b border-white/15 py-3 text-xs text-white/70">
            <span>
              {optionLabel}
              {servings(option) && ` · ${servings(option)}`}
            </span>
            <strong className="font-medium text-white">{option.price === null ? t("onRequest") : money(option.price)}</strong>
          </div>
          {photo && (
            <div className="flex justify-between gap-3 border-b border-white/15 py-3 text-xs text-white/70">
              <span>{t("photo")}</span>
              <strong className="font-medium text-white">+{money(PHOTO_EXTRA)}</strong>
            </div>
          )}

          <div className="flex items-end justify-between gap-3 pt-5 text-xs">
            <span>{phonePricing ? t("phonePricing") : t("estimated")}</span>
            <strong className="font-serif text-2xl text-blush">{phonePricing || total === null ? "—" : money(total)}</strong>
          </div>
          <p className="mt-5 text-[11px] leading-relaxed text-white/50">{t("finalPrice")}</p>
        </aside>
      </div>
    </section>
  );
}
