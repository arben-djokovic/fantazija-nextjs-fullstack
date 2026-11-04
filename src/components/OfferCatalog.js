"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import { eyebrow, linkBtn, page, sectionTitle } from "@/components/styles";
import { Link } from "@/i18n/navigation";

const cakeCategories = ["all", "classic", "premium", "special"];

const tabs = [
  { value: "cakes", labelKey: "tabCakes" },
  { value: "pastries", labelKey: "tabPastries" },
];

// Hash iz adrese (/offer#slug), na serveru prazan.
const subscribeHash = (onChange) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const getHash = () => decodeURIComponent(window.location.hash.slice(1));
const getServerHash = () => "";

// Next čuva stanje stranice između navigacija (Activity), pa bi se pri ponovnom dolasku linkom
// zadržali stari tab i već završeno isticanje. Ključ bfcacheId se mijenja pri svakom kliku na link,
// pa katalog kreće ispočetka, a na nazad/naprijed ostaje isti i stanje se vraća.
export default function OfferCatalog(props) {
  const { bfcacheId } = useRouter();
  return <Catalog key={bfcacheId} {...props} />;
}

function Catalog({ cakes, pastries }) {
  const t = useTranslations("Offer");
  const [chosenTab, setTab] = useState(null);
  const [category, setCategory] = useState("all");
  const [highlightDone, setHighlightDone] = useState(false);

  // Link sa početne (/offer#slug) otvara tab u kojem je proizvod, skroluje do njega i kratko ga istakne.
  // Kategorija je na početku "Sve", pa je proizvod sigurno prikazan.
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const target = hash && [...cakes, ...pastries].find((item) => item.slug === hash);
  const tab = chosenTab ?? (target?.type === "pastry" ? "pastries" : "cakes");
  const highlighted = !highlightDone && target ? target.slug : null;

  useEffect(() => {
    if (!highlighted) return;
    document.getElementById(highlighted)?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(() => setHighlightDone(true), 2000);
    return () => window.clearTimeout(timer);
  }, [highlighted]);

  const visibleCakes = category === "all" ? cakes : cakes.filter((cake) => cake.category === category);

  return (
    <section className={page}>
      <div className="mb-12 text-center">
        <p className={`${eyebrow} justify-center`}>{t("eyebrow")}</p>
        <h1 className={sectionTitle}>{t("title")}</h1>
        <p className="mx-auto max-w-xl leading-relaxed text-muted">{t("subtitle")}</p>
      </div>

      <div className="mb-10 flex justify-center">
        <div role="tablist" className="inline-flex gap-1 rounded-full border border-line bg-white p-1">
          {tabs.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={tab === item.value}
              onClick={() => setTab(item.value)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                tab === item.value ? "bg-primary text-white" : "text-muted hover:text-ink"
              }`}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {tab === "cakes" ? (
        <>
          <div className="relative isolate mb-10 grid grid-cols-1 items-center gap-6 overflow-hidden rounded-[20px] border border-primary/30 bg-[linear-gradient(115deg,color-mix(in_srgb,var(--color-primary)_12%,var(--color-card)),var(--color-card)_60%)] px-6 py-8 shadow-[0_18px_50px_color-mix(in_srgb,var(--color-primary)_9%,transparent)] md:grid-cols-[minmax(0,1fr)_auto] md:gap-8 md:rounded-[24px] md:px-12 md:py-[42px]">
            <span aria-hidden="true" className="absolute -top-28 -right-17 -z-10 size-[300px] rounded-full bg-primary/20 blur-[2px]" />
            <div>
              <p className="mb-3 text-[11px] font-bold tracking-[0.2em] text-primary">{t("bannerEyebrow")}</p>
              <h2 className="max-w-[520px] font-serif text-[clamp(34px,5vw,58px)] leading-[0.98] tracking-[-2px] text-ink">
                {t("bannerTitle")}
              </h2>
              <p className="mt-4 max-w-[510px] text-[15px] leading-[1.65] text-muted">{t("bannerText")}</p>
            </div>
            <Link href="/cake-builder" className={`${linkBtn} h-12 whitespace-nowrap px-[22px] md:justify-self-end`}>
              {t("bannerCta")} <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {cakeCategories.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  category === value
                    ? "border-primary bg-primary text-white"
                    : "border-line text-muted hover:border-primary hover:text-primary"
                }`}
              >
                {t(`categories.${value}`)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleCakes.map((cake) => (
              <OfferCard key={cake.id} product={cake} highlighted={highlighted === cake.slug} />
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pastries.map((pastry) => (
            <OfferCard key={pastry.id} product={pastry} highlighted={highlighted === pastry.slug} />
          ))}
        </div>
      )}
    </section>
  );
}
