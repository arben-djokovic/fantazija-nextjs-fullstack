import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.gallery" });
  return { title: t("title") };
}

async function GalleryContent({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Gallery");

  return <h1 className="text-3xl font-semibold text-zinc-800">{t("title")}</h1>;
}

export default function GalleryPage({ params }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16">
      <Suspense fallback={null}>
        <GalleryContent params={params} />
      </Suspense>
    </main>
  );
}
