import { getTranslations, setRequestLocale } from "next-intl/server";
import OfferCatalog from "@/components/OfferCatalog";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.offer" });
  return { title: t("title"), description: t("description") };
}

export default async function OfferPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <OfferCatalog />
    </main>
  );
}
