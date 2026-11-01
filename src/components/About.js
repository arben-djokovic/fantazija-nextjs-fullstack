/* eslint-disable @next/next/no-img-element */
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { eyebrow, sectionTitle, textLink } from "@/components/styles";

export default async function About() {
  const t = await getTranslations("About");

  return (
    <section id="about" className="scroll-mt-24 bg-blush px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=85"
            alt={t("imageAlt")}
            className="h-[370px] w-full rounded-xl object-cover md:h-[500px]"
          />
          <div className="absolute -right-2 -bottom-6 flex size-28 rotate-6 flex-col items-center justify-center rounded-full bg-[#fffaf5] text-primary md:-right-9">
            <strong className="font-serif text-4xl leading-none font-normal">{t("badgeNumber")}</strong>
            <span className="mt-2 text-center text-[10px] tracking-wider uppercase">
              {t("badgeLine1")}
              <br />
              {t("badgeLine2")}
            </span>
          </div>
        </div>

        <div>
          <p className={eyebrow}>{t("eyebrow")}</p>
          <h2 className={sectionTitle}>
            {t("titleLine1")}
            <br className="hidden md:block" /> {t("titleLine2")} <em className="text-primary italic">{t("titleAccent")}</em>
          </h2>
          <p className="max-w-md leading-relaxed text-muted">{t("text")}</p>
          <p className="my-8 font-serif text-xl italic text-ink md:text-2xl">{t("quote")}</p>
          <Link href="/#contact" className={textLink}>
            {t("cta")} <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
