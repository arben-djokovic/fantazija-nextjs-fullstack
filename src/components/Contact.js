import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import { eyebrow } from "@/components/styles";
import { INSTAGRAM_URL, MAPS_URL } from "@/data/contact";

export default function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 grid gap-[90px] bg-ink px-8 pt-25 pb-16 text-[#fffaf5] max-md:flex max-md:flex-col max-md:gap-10 max-md:px-5 max-md:pt-19 md:grid-cols-2">
      <div className="max-w-[500px]">
        <p style={{color: "#e8b3c4"}} className={`${eyebrow}`}>06 · Kontakt</p>
        <h2 className="mb-4 font-serif text-[clamp(38px,4vw,57px)] leading-none tracking-[-2px] text-[#fffaf5]">Posjetite nas</h2>
        <p className="text-[15px] leading-[1.7] text-[#c8b8b0]">Dođite da se upoznamo — vrata su vam uvijek otvorena.</p>
        <div className="mt-6 md:mt-9.5 md:my-9.5 flex flex-col gap-5">
          <a href={MAPS_URL} target="_blank" rel="noreferrer" className="group grid grid-cols-[23px_1fr] gap-x-2.25">
            <MapPin className="row-span-2 size-3.75 text-[#e8b3c4]" />
            <strong className="text-[13px] font-medium group-hover:underline">Tuzi, Montenegro</strong>
            <small className="mt-0.75 text-[11px] text-[#a8958c] group-hover:underline">Google Maps plus code · 986H+GW9</small>
          </a>
          <span className="grid grid-cols-[23px_1fr] gap-x-2.25">
            <Clock className="row-span-2 size-3.75 text-[#e8b3c4]" />
            <strong className="text-[13px] font-medium">Otvoreno svakog dana</strong>
            <small className="mt-0.75 text-[11px] text-[#a8958c]">09:00 – 22:00</small>
          </span>
          <a href="tel:+38268210652" className="group grid grid-cols-[23px_1fr] gap-x-2.25">
            <Phone className="row-span-2 size-3.75 text-[#e8b3c4]" />
            <strong className="text-[13px] font-medium group-hover:underline">068 210 652</strong>
            <small className="mt-0.75 text-[11px] text-[#a8958c] group-hover:underline">Viber · +382 68 210 652</small>
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="group grid grid-cols-[23px_1fr] gap-x-2.25">
            <FaInstagram className="row-span-2 size-3.75 text-[#e8b3c4]" />
            <strong className="text-[13px] font-medium group-hover:underline">@fantazija20</strong>
            <small className="mt-0.75 text-[11px] text-[#a8958c] group-hover:underline">Instagram</small>
          </a>
        </div>
      </div>

      <div className="relative min-h-95 overflow-hidden rounded-xl bg-[#eadfd6] max-md:min-h-[300px]">
        <iframe
          title="Fantazija na Google mapi"
          src="https://maps.google.com/maps?q=42.3611983,19.3299411&z=17&output=embed"
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-primary shadow-md"
        >
          Otvori u Google Maps <ArrowRight className="size-3.5" />
        </a>
      </div>
    </section>
  );
}
