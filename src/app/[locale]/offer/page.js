import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import OfferCatalog from "@/components/OfferCatalog";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.offer" });
  return { title: t("title"), description: t("description") };
}

async function OfferContent({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <OfferCatalog />;
}

export default function OfferPage({ params }) {
  return (
    <main>
      <Suspense fallback={null}>
        <OfferContent params={params} />
      </Suspense>
    </main>
  );
}
