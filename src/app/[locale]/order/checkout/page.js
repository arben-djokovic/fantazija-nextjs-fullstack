import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import CheckoutView from "@/components/CheckoutView";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({ locale, href: "/order/checkout", namespace: "checkout", index: false });
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
