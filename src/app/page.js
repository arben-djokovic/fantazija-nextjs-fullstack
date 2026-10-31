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
    </main>
  );
}
