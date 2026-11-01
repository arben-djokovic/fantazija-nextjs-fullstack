/* eslint-disable @next/next/no-img-element */
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { eyebrow, sectionTitle, textLink } from "@/components/styles";
import { formatPrice } from "@/lib/format";

const products = [
  { id: "cokoladna", price: 20, unit: "from", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85", tag: "popular" },
  { id: "vocna", price: 20, unit: "from", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85", tag: "new" },
  { id: "trilece", price: 1.5, unit: "piece", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=85", tag: "popular" },
  { id: "rafaelo", price: 1.8, unit: "piece", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85" },
];

export default async function Offer() {
  const t = await getTranslations("OfferHome");
  const locale = await getLocale();

  return (
    <section id="offer" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-12 md:px-8 md:py-28">
      <div className="mb-8 flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className={eyebrow}>{t("eyebrow")}</p>
          <h2 className={sectionTitle}>{t("title")}</h2>
          <p className="leading-relaxed text-muted">{t("subtitle")}</p>
        </div>
        <Link href="/offer" className={`${textLink} hidden md:inline-flex`}>
          {t("seeAll")} <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-5">
        {products.map((product) => {
          const name = t(`products.${product.id}.name`);
          const price =
            product.unit === "piece"
              ? t("pricePiece", { price: formatPrice(product.price, locale) })
              : t("priceFrom", { price: formatPrice(product.price, locale) });

          return (
            <Link key={product.id} href="/offer" className="group">
              <div className="relative overflow-hidden rounded-xl bg-line">
                <img src={product.image} alt={name} className="aspect-[0.91] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                {product.tag && (
                  <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[10px] text-white">
                    {product.tag === "popular" ? t("tagPopular") : t("tagNew")}
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-col gap-1 md:flex-row md:justify-between md:gap-3">
                <div>
                  <h3 className="font-serif text-lg text-ink md:text-xl">{name}</h3>
                  <p className="hidden text-xs leading-relaxed text-muted md:block">{t(`products.${product.id}.desc`)}</p>
                </div>
                <strong className="text-xs whitespace-nowrap text-primary">{price}</strong>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center md:hidden">
        <Link href="/offer" className={textLink}>
          {t("seeAll")} <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
