import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CakeBuilder from "@/components/CakeBuilder";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.cakeBuilder" });
  return { title: t("title"), description: t("description") };
}

async function CakeBuilderContent({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CakeBuilder />;
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
