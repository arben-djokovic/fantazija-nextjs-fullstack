import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import CakeBuilder from "@/components/CakeBuilder";
import { getActiveItems, toLocalizedItem } from "@/lib/items";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({ locale, href: "/cake-builder", namespace: "cakeBuilder" });
}

async function CakeBuilderContent({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Ukusi u builderu su sve aktivne torte iz ponude, a veličine njihove opcije.
  const cakes = (await getActiveItems({ type: "cake" })).map((item) => toLocalizedItem(item, locale));

  return <CakeBuilder cakes={cakes} />;
}

export default function CakeBuilderPage({ params }) {
  return (
    <main>
      <Suspense fallback={null}>
        <CakeBuilderContent params={params} />
      </Suspense>
    </main>
  );
}
