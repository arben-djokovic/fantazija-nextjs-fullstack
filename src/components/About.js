/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { eyebrow, sectionTitle, textLink } from "@/components/styles";

export default function About() {
  return (
    <section id="about" className="scroll-mt-24 bg-blush px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=85"
            alt="Topla i ugodna slastičarnica"
            className="h-[370px] w-full rounded-xl object-cover md:h-[500px]"
          />
          <div className="absolute -right-2 -bottom-6 flex size-28 rotate-6 flex-col items-center justify-center rounded-full bg-[#fffaf5] text-primary md:-right-9">
            <strong className="font-serif text-4xl leading-none font-normal">12</strong>
            <span className="mt-2 text-center text-[10px] tracking-wider uppercase">
              godina
              <br />
              slatkih priča
            </span>
          </div>
        </div>

        <div>
          <p className={eyebrow}>02 · O nama</p>
          <h2 className={sectionTitle}>
            Porodica, tradicija
            <br className="hidden md:block" /> i mnogo <em className="text-primary italic">ljubavi.</em>
          </h2>
          <p className="max-w-md leading-relaxed text-muted">
            Fantazija je mala porodična poslastičarnica u srcu Tuzi. Od 2012. godine pravimo torte i kolače koji okupljaju ljude oko stola — od prvog zalogaja do posljednje mrvice.
          </p>
          <p className="my-8 font-serif text-xl italic text-ink md:text-2xl">„Najljepše uspomene počinju nečim slatkim.”</p>
          <Link href="/#contact" className={textLink}>
            Posjetite nas <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
