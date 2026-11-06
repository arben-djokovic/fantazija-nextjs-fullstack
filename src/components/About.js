import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { eyebrow, sectionTitle, textLink } from "@/components/styles";
import { FOUNDED_YEAR } from "@/data/contact";
import { currentYear } from "@/lib/year";

export default async function About() {
  const t = await getTranslations("About");
  const years = (await currentYear()) - FOUNDED_YEAR;

  return (
    <section id="about" className="scroll-mt-24 bg-blush px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <div className="relative">
          <Image
            src="/assets/vitrina.jpeg"
            alt={t("imageAlt")}
            width={1280}
            height={960}
            sizes="(min-width: 1152px) 528px, (min-width: 1024px) 45vw, 100vw"
            className="h-[370px] w-full rounded-xl object-cover md:h-[500px]"
          />
          <div className="absolute -right-2 -bottom-6 flex size-28 rotate-6 flex-col items-center justify-center rounded-full bg-[#fffaf5] text-primary md:-right-9">
            <strong className="font-serif text-4xl leading-none font-normal">{years}</strong>
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
          <p className="max-w-md leading-relaxed text-muted">{t("text", { year: FOUNDED_YEAR })}</p>
          <p className="my-8 font-serif text-xl italic text-ink md:text-2xl">{t("quote")}</p>
          <Link href="/#contact" className={textLink}>
            {t("cta")} <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
