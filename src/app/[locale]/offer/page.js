import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import OfferCatalog from "@/components/OfferCatalog";
import { getActiveItems, toLocalizedItem } from "@/lib/items";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({ locale, href: "/offer", namespace: "offer" });
}

async function OfferContent({ params, searchParams }) {
  const { locale } = await params;
  const { tab } = await searchParams;
  setRequestLocale(locale);

  const items = (await getActiveItems()).map((item) => toLocalizedItem(item, locale));

  return (
    <OfferCatalog
      cakes={items.filter((item) => item.type === "cake")}
      pastries={items.filter((item) => item.type === "pastry")}
      initialTab={tab === "pastries" ? "pastries" : "cakes"}
    />
  );
}

// Tab je u adresi: /offer su torte, /offer?tab=pastries kolači, da reload i poslat link otvore isti tab.
export default function OfferPage({ params, searchParams }) {
  return (
    <main>
      <Suspense fallback={null}>
        <OfferContent params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
