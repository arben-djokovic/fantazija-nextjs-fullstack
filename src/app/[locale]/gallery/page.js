import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { page } from "@/components/styles";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({ locale, href: "/gallery", namespace: "gallery", index: false });
}

async function GalleryContent({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Gallery");

  return <h1 className="text-3xl font-semibold text-zinc-800">{t("title")}</h1>;
}

export default function GalleryPage({ params }) {
  return (
    <main className={page}>
      <Suspense fallback={null}>
        <GalleryContent params={params} />
      </Suspense>
    </main>
  );
}
