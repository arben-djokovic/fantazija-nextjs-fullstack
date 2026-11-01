import { getTranslations, setRequestLocale } from "next-intl/server";
import CheckoutView from "@/components/CheckoutView";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.checkout" });
  return { title: t("title"), description: t("description") };
}

export default async function CheckoutPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <CheckoutView />
    </main>
  );
}
