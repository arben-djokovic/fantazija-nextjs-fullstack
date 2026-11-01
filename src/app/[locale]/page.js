import { getTranslations, setRequestLocale } from "next-intl/server";
import Hero from "@/components/Hero";
import Offer from "@/components/Offer";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.home" });
  return { title: t("title"), description: t("description") };
}

export default async function Home({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="overflow-hidden">
      <Hero />
      <Offer />
      <About />
      <Gallery />
      <Contact />
    </main>
  );
}
