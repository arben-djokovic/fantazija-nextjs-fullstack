import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CheckoutView from "@/components/CheckoutView";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.checkout" });
  return { title: t("title"), description: t("description") };
}

async function CheckoutContent({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CheckoutView />;
}

export default function CheckoutPage({ params }) {
  return (
    <main>
      <Suspense fallback={null}>
        <CheckoutContent params={params} />
      </Suspense>
    </main>
  );
}
