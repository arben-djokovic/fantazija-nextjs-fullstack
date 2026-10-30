import { Phone } from "lucide-react";
import Hero from "@/components/Hero";
import Offer from "@/components/Offer";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <Offer />
      <About />
      <Gallery />
      <Contact />

      <a href="tel:+38268210652" className="fixed right-4 bottom-4 z-20 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs text-white shadow-lg md:hidden">
        <Phone className="size-3.5" fill="currentColor" /> Pozovi
      </a>
    </main>
  );
}
