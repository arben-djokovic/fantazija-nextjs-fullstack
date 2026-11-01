import { getTranslations, setRequestLocale } from "next-intl/server";
import CakeBuilder from "@/components/CakeBuilder";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.cakeBuilder" });
  return { title: t("title"), description: t("description") };
}

export default async function CakeBuilderPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <CakeBuilder />
    </main>
  );
}
