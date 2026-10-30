import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { eyebrow, linkBtn, textLink } from "@/components/styles";

const heroImage = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=85";

export default function Hero() {
  return (
    <section id="top" className="mx-auto grid min-h-[620px] max-w-[1240px] items-center gap-[70px] px-8 pt-9 pb-18 max-lg:flex max-md:flex-col max-md:gap-11 max-md:px-5 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="max-md:order-2 w-full">
        <p className={eyebrow}>
          <Heart className="size-3.25" fill="currentColor" /> Poslastičarnica u Tuzima · od 2012.
        </p>
        <h1 className="mb-7 font-serif text-[clamp(55px,6.3vw,90px)] leading-[0.94] font-normal tracking-[-4px] text-ink">
          Slatki trenuci
          <br />
          za pamćenje.
        </h1>
        <p className="max-w-100 text-[15px] leading-[1.8] text-muted">
          Domaće torte, kolači i miris kafe — napravljeno s ljubavlju za važne i sasvim obične dane.
        </p>
        <div className="mt-8 flex items-center gap-7">
          <Link href="/offer" className={linkBtn}>
            Pogledajte ponudu <ArrowRight className="size-4" />
          </Link>
          <Link href="/#about" className={textLink}>
            Upoznajte nas <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-17 flex items-center gap-3 text-[11px] uppercase tracking-[0.1em] text-[#a89891]">
          <span className="h-px w-10.5 bg-gold" />
          <span>Tuzi · Montenegro</span>
        </div>
      </div>

      <div className="hidden md:block relative w-full lg:max-w-[410px] justify-self-center max-md:order-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImage} alt="Elegantna čokoladna torta sa bobičastim voćem" className="block h-[350px] w-full rounded-t-[130px] rounded-b-2xl object-cover max-md:h-[380px] md:max-w-[300px] lg:max-w-[5100px]" />
        <div className="absolute -left-8 bottom-7 flex size-27 rotate-[-10deg] flex-col items-center justify-center rounded-full bg-blush text-primary max-md:-right-2 max-md:-bottom-6 max-md:left-auto">
          <span className="text-[10px]">made with</span>
          <strong className="font-serif text-[25px] font-normal italic">love</strong>
          <Heart className="mt-1 size-2.75" fill="currentColor" />
        </div>
      </div>
    </section>
  );
}
