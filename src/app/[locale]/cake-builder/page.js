import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import CakeBuilder from "@/components/CakeBuilder";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({ locale, href: "/cake-builder", namespace: "cakeBuilder" });
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
