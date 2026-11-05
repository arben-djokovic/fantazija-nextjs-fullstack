import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { eyebrow, sectionTitle, textLink } from "@/components/styles";
import { formatPrice } from "@/lib/format";
import { getActiveItems, toLocalizedItem } from "@/lib/items";
import { canOptimize } from "@/lib/images";

// Najjeftinija opcija sa poznatom cijenom; null ako se sve opcije dogovaraju telefonom.
function cheapestOption(item) {
  return item.options
    .filter((option) => option.price !== null)
    .reduce((cheapest, option) => (!cheapest || option.price < cheapest.price ? option : cheapest), null);
}

export default async function Offer() {
  const t = await getTranslations("OfferHome");
  const tCart = await getTranslations("Cart");
  const locale = await getLocale();
  const products = (await getActiveItems({ featured: true })).map((item) => toLocalizedItem(item, locale));

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
        {products.map((product, i) => {
          const cheapest = cheapestOption(product);
          // Ako je najjeftinije po komadu, piše "1,50 € / kom", inače "od 15,00 €".
          const price = !cheapest
            ? tCart("priceOnRequest")
            : t(cheapest.key === "komad" ? "pricePiece" : "priceFrom", { price: formatPrice(cheapest.price, locale) });

          return (
            <Link key={product.id} href={`/offer#${product.slug}`} className={`group ${i > 5 ? "hidden md:block" : ""}`}>
              <div className="relative overflow-hidden rounded-xl bg-line">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={660}
                  sizes="(min-width: 1280px) 300px, (min-width: 768px) 25vw, 50vw"
                  unoptimized={!canOptimize(product.image)}
                  className="aspect-[0.91] h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 flex flex-col gap-1 md:flex-row md:justify-between md:gap-3">
                <div>
                  <h3 className="font-serif text-lg text-ink md:text-xl">{product.name}</h3>
                  <p className="hidden text-xs leading-relaxed text-muted md:block">{product.description}</p>
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
