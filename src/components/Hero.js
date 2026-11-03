import { getTranslations } from "next-intl/server";
import { ArrowRight, Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { eyebrow, linkBtn, textLink } from "@/components/styles";
import { FOUNDED_YEAR } from "@/data/contact";

const heroImage = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=85";

export default async function Hero() {
  const t = await getTranslations("Hero");

  return (
    <section id="top" className="mx-auto grid max-w-[1240px] items-center gap-[70px] px-8 pt-9 pb-10 md:min-h-[620px] md:pb-18 max-lg:flex max-md:flex-col max-md:gap-11 max-md:px-5 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="max-md:order-2 w-full">
        <p className={eyebrow}>
          <Heart className="size-3.25" fill="currentColor" /> {t("eyebrow", { year: FOUNDED_YEAR })}
        </p>
        <h1 className="mb-7 font-serif text-[clamp(55px,6.3vw,90px)] leading-[0.94] font-normal tracking-[-4px] text-ink">
          {t("titleLine1")}
          <br />
          {t("titleLine2")}
        </h1>
        <p className="max-w-100 text-[15px] leading-[1.8] text-muted">{t("text")}</p>
        <div className="mt-8 flex items-center gap-7">
          <Link href="/offer" className={linkBtn}>
            {t("viewOffer")} <ArrowRight className="size-4" />
          </Link>
          <Link href="/#about" className={textLink}>
            {t("meetUs")} <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-10 flex items-center gap-3 md:mt-17 text-[11px] uppercase tracking-[0.1em] text-[#a89891]">
          <span className="h-px w-10.5 bg-gold" />
          <span>{t("location")}</span>
        </div>
      </div>

      <div className="hidden md:block relative w-full lg:max-w-[410px] justify-self-center max-md:order-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImage} alt={t("imageAlt")} className="block h-[350px] w-full rounded-t-[130px] rounded-b-2xl object-cover max-md:h-[380px] md:max-w-[300px] lg:max-w-[5100px]" />
        <div className="absolute -left-8 bottom-7 flex size-27 rotate-[-10deg] flex-col items-center justify-center rounded-full bg-blush text-primary max-md:-right-2 max-md:-bottom-6 max-md:left-auto">
          <span className="text-[10px]">made with</span>
          <strong className="font-serif text-[25px] font-normal italic">love</strong>
          <Heart className="mt-1 size-2.75" fill="currentColor" />
        </div>
      </div>
    </section>
  );
}
