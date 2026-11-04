import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import Hero from "@/components/Hero";
import Offer from "@/components/Offer";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({ locale, href: "/", namespace: "home", absoluteTitle: true });
}

// Locale se čita unutar Suspense granice, da navigacija između jezika bude odmah.
async function HomeContent({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <LocalBusinessJsonLd locale={locale} />
      <Hero />
      {/* Ponuda se čita iz baze, pa ima svoju Suspense granicu da ostatak strane ne čeka. */}
      <Suspense fallback={null}>
        <Offer />
      </Suspense>
      <About />
      <Gallery />
      <Contact />
    </>
  );
}

export default function Home({ params }) {
  return (
    <main className="overflow-hidden">
      <Suspense fallback={null}>
        <HomeContent params={params} />
      </Suspense>
    </main>
  );
}
