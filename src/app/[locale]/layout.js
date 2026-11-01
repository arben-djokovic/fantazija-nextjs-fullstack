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

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body className="min-h-full w-full flex flex-col bg-white">
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <SmoothAnchors />
            <Header />
            {children}
            <Footer />
            <FloatingCart />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
