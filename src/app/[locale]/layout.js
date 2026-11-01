import "../globals.css";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/cart-context";
import FloatingCart from "@/components/FloatingCart";
import SmoothAnchors from "@/components/SmoothAnchors";
import PageLoader from "@/components/PageLoader";

// Layout čita jezik iz URL-a za <html lang>, pa navigacija na drugi jezik čeka ovaj layout.
export const instant = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.home" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const tLoader = await getTranslations("Loader");

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body className="min-h-full w-full flex flex-col bg-white">
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <PageLoader label={tLoader("loading")} />
            <SmoothAnchors />
            <Header />
            <div className="flex-1 min-h-[calc(100vh-200px)] w-full flex flex-col justify-center">
            {children}
            </div>
            <Footer />
            <FloatingCart />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
