/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { eyebrow, section, sectionTitle, textLink } from "@/components/styles";

const products = [
  { name: "Čokoladna torta", desc: "Bogat čokoladni biskvit, svilenkasta krema i malo magije.", price: "od 20 €", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85", tag: "Popular" },
  { name: "Voćna torta", desc: "Lagana vanilija krema sa sezonskim voćem i svježom radošću.", price: "od 20 €", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85", tag: "New" },
  { name: "Trileće", desc: "Mekano, mliječno i nevjerovatno nežno — pravi favorit.", price: "1,50 € / kom", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=85", tag: "Popular" },
  { name: "Rafaelo", desc: "Kokos, bijela čokolada i krema od prženog badema.", price: "1,80 € / kom", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85" },
];

export default function Offer() {
  return (
    <section id="offer" className={`${section} scroll-mt-24`}>
      <div className="mb-8 flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className={eyebrow}>01 · Ponuda</p>
          <h2 className={sectionTitle}>Iz naše vitrine</h2>
          <p className="leading-relaxed text-muted">Mali izbor velikih uživanja, svakog dana svježe.</p>
        </div>
        <Link href="/offer" className={`${textLink} hidden md:inline-flex`}>
          Pogledaj cijelu ponudu <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-5">
        {products.map((product) => (
          <Link key={product.name} href="/offer" className="group">
            <div className="relative overflow-hidden rounded-xl bg-line">
              <img src={product.image} alt={product.name} className="aspect-[0.91] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {product.tag && (
                <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[10px] text-white">{product.tag}</span>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-1 md:flex-row md:justify-between md:gap-3">
              <div>
                <h3 className="font-serif text-lg text-ink md:text-xl">{product.name}</h3>
                <p className="hidden text-xs leading-relaxed text-muted md:block">{product.desc}</p>
              </div>
              <strong className="text-xs whitespace-nowrap text-primary">{product.price}</strong>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex justify-center md:hidden">
        <Link href="/offer" className={textLink}>
          Pogledaj cijelu ponudu <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
