"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { cakeCategories, cakes, pastries } from "@/data/offer";
import OfferCard from "@/components/OfferCard";
import { eyebrow, linkBtn, sectionTitle } from "@/components/styles";
import { Link } from "@/i18n/navigation";

const tabs = [
  { value: "cakes", labelKey: "tabCakes" },
  { value: "pastries", labelKey: "tabPastries" },
];

export default function OfferCatalog() {
  const t = useTranslations("Offer");
  const [tab, setTab] = useState("cakes");
  const [category, setCategory] = useState("all");

  const visibleCakes = category === "all" ? cakes : cakes.filter((cake) => cake.category === category);

  return (
    <section className="mx-auto max-w-7xl px-5 pt-8 pb-20 md:px-8 md:pt-12 md:pb-28">
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
            {cakeCategories.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setCategory(item.value)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  category === item.value
                    ? "border-primary bg-primary text-white"
                    : "border-line text-muted hover:border-primary hover:text-primary"
                }`}
              >
                {t(`categories.${item.value}`)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleCakes.map((cake) => (
              <OfferCard key={cake.id} kind="cake" product={cake} />
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pastries.map((pastry) => (
            <OfferCard key={pastry.id} kind="pastry" product={pastry} />
          ))}
        </div>
      )}
    </section>
  );
}
