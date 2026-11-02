"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Heart, Phone, Upload } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { eyebrow, fieldInput, linkBtn, section } from "@/components/styles";
import { formatPrice } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import {
  CAKE_TYPES,
  FLAVOURS,
  PHOTO_EXTRA,
  SIZE_PRICES,
  customCakeBasePrice,
  customCakePrice,
  needsPhonePricing,
} from "@/data/cakeBuilder";

// Termin preuzimanja i podatke kupca unosi checkout, pa se torta ovdje samo sastavi i doda u korpu.
const STEP_KEYS = ["type", "flavour", "decoration"];

// Gradijenti služe kao uzorci ukusa dok nemamo fotografije.
const SWATCHES = [
  "from-[#e9b5a4] to-[#6a271c]",
  "from-[#f2dbd5] to-[#b72f5d]",
  "from-[#d9b394] to-[#65351f]",
  "from-[#eee1c7] to-[#d5a06c]",
];

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

function FileDrop({ label, files, onFiles }) {
  return (
    <label className="relative mb-5 flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-primary/40 bg-blush/40 text-xs text-primary">
      <span className="flex items-center gap-2 font-semibold">
        <Upload className="size-4" /> {label}
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
  const t = useTranslations("CakeBuilder");
  const tCheckout = useTranslations("Checkout");
  const locale = useLocale();
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
  const [submitted, setSubmitted] = useState(false);

  const basePrice = customCakeBasePrice({ cakeType, size });
  const total = customCakePrice({ cakeType, size, photo });
  const phonePricing = needsPhonePricing({ cakeType, wishes });
  const cakeName = cakeType === "special" ? t("specialCake") : t(`flavours.${flavour}`);
  const optionLabel = cakeType === "classic" ? t(`sizes.${size}.label`) : t(`types.${cakeType}.label`);
  const money = (value) => formatPrice(value, locale);

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
      // Izbori idu serveru, koji sam provjerava tortu i računa cijenu.
      custom: {
        cakeType,
        flavour: cakeType === "special" ? undefined : flavour,
        size: cakeType === "classic" ? size : undefined,
        photo,
        inscription: inscription.trim() || undefined,
        wishes: wishes.trim() || undefined,
        idea: cakeType === "special" ? idea.trim() || undefined : undefined,
        fasting,
        glutenFree: gluten,
      },
      summary:
        [
          cakeType === "special" && idea.trim(),
          wishes.trim(),
          inscription.trim() && `${t("inscription")}: ${inscription.trim()}`,
          fasting && t("fasting"),
          gluten && t("gluten"),
        ]
          .filter(Boolean)
          .join(" · ") || undefined,
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
          <p className={`${eyebrow} justify-center`}>{tCheckout("eyebrowText")}</p>
          <h1 className="mb-5 font-serif text-5xl text-ink">{t("successTitle")}</h1>
          <p className="leading-relaxed text-muted">{t("successText")}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/order/checkout" className={linkBtn}>
              {t("viewCart")}
            </Link>
            <a href="tel:+38268210652" className="inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 text-sm font-semibold text-ink transition-colors hover:border-primary">
              <Phone className="size-4" /> {t("callUs")}
            </a>
          </div>
        </div>
      </section>
    );
  }

  const next = () => setStep((current) => Math.min(current + 1, STEP_KEYS.length));
  const previous = () => setStep((current) => Math.max(current - 1, 1));

  return (
    <section className={section}>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
        <div>
          <Link href="/offer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-ink">
            <ArrowLeft className="size-4" /> {t("backToOffer")}
          </Link>

          <div className="mt-12 mb-10">
            <p className={eyebrow}>{t("eyebrow")}</p>
            <h1 className="mb-4 font-serif text-5xl leading-none tracking-tight text-ink md:text-6xl">{t("title")}</h1>
            <p className="max-w-xl leading-relaxed text-muted">{t("intro")}</p>
          </div>

          <ol className="mb-8 flex items-center">
            {STEP_KEYS.map((key, index) => (
              <li key={key} className={`flex items-center gap-2 ${index < STEP_KEYS.length - 1 ? "flex-1" : ""} ${step >= index + 1 ? "text-primary" : "text-muted/70"}`}>
                <StepBadge index={index} step={step} />
                <span className="hidden text-[11px] whitespace-nowrap md:inline">{t(`steps.${key}`)}</span>
                {index < STEP_KEYS.length - 1 && <span className="mx-2 hidden h-px flex-1 bg-line md:block" />}
              </li>
            ))}
          </ol>

          <div className="flex min-h-[460px] flex-col rounded-2xl border border-line bg-card p-6 md:p-8">
            {step === 1 && (
              <>
                <h2 className="mb-6 font-serif text-3xl text-ink">{t("steps.type")}</h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {Object.entries(CAKE_TYPES).map(([type, info]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => selectType(type)}
                      className={`${cardBase} md:min-h-52 ${cakeType === type ? selectedRing : ""}`}
                    >
                      <span className="mb-2 font-serif text-xl text-primary italic md:mb-6 md:text-2xl">{info.icon}</span>
                      <strong className="font-serif text-lg text-ink md:text-xl">{t(`types.${type}.label`)}</strong>
                      <p className="mt-1 mb-3 text-xs leading-relaxed text-muted md:mt-2 md:mb-4">{t(`types.${type}.hint`)}</p>
                      <em className="mt-auto text-xs text-primary not-italic">
                        {info.price === null
                          ? t("onRequest")
                          : type === "classic"
                            ? t("priceFrom", { price: money(info.price) })
                            : money(info.price)}
                      </em>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {cakeType === "special" ? (
                  <>
                    <h2 className="mb-6 font-serif text-3xl text-ink">{t("ideaTitle")}</h2>
                    <label className="mb-5 flex flex-col gap-2 text-xs font-semibold text-ink">
                      {t("idea")}
                      <textarea
                        value={idea}
                        onChange={(event) => setIdea(event.target.value)}
                        placeholder={t("ideaPlaceholder")}
                        className={`${fieldInput} min-h-28 resize-y`}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <h2 className="mb-6 font-serif text-3xl text-ink">{t("chooseFlavour")}</h2>
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
                          <strong className="flex-1 font-serif text-base text-ink">{t(`flavours.${item}`)}</strong>
                          <Check className={`size-4 text-primary ${flavour === item ? "opacity-100" : "opacity-0"}`} />
                        </button>
                      ))}
                    </div>

                    {cakeType === "classic" && (
                      <>
                        <h3 className="mb-3 font-serif text-lg text-ink">{t("size")}</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {Object.keys(SIZE_PRICES).map((key) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSize(key)}
                              className={`${cardBase} gap-1 ${size === key ? selectedRing : ""}`}
                            >
                              <strong className="font-serif text-lg text-ink">{t(`sizes.${key}.label`)}</strong>
                              <span className="text-xs text-muted">
                                {t(`sizes.${key}.people`)} · {money(SIZE_PRICES[key])}
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
                <h2 className="mb-6 font-serif text-3xl text-ink">{t("decorationTitle")}</h2>
                <Toggle
                  label={t("photoLabel")}
                  hint={t("photoHint", { price: money(PHOTO_EXTRA) })}
                  checked={photo}
                  onChange={setPhoto}
                />
                {photo && <FileDrop label={t("addPhoto")} files={photoFiles} onFiles={addFiles} />}

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
                  className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {t("addToCart")} <ArrowRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="self-start rounded-2xl bg-ink p-6 text-white lg:sticky lg:top-24">
          <p className="mb-4 text-xs font-semibold tracking-widest text-blush uppercase">{t("summaryTitle")}</p>
          <h3 className="mb-6 font-serif text-2xl">{cakeName || t(`types.${cakeType}.label`)}</h3>

          <div className="flex justify-between gap-3 border-b border-white/15 py-3 text-xs text-white/70">
            <span>{t(`types.${cakeType}.label`)}</span>
            <strong className="font-medium text-white">{basePrice === null ? t("onRequest") : money(basePrice)}</strong>
          </div>
          {cakeType === "classic" && (
            <div className="flex justify-between gap-3 border-b border-white/15 py-3 text-xs text-white/70">
              <span>{t(`sizes.${size}.label`)}</span>
              <span>{t(`sizes.${size}.people`)}</span>
            </div>
          )}
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
