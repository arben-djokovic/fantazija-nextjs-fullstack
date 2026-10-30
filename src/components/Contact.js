import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { eyebrow } from "@/components/styles";

const actionCard =
  "group flex items-center gap-3 rounded-2xl p-3 pr-5 text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg";
const actionIcon = "flex size-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-white";
const actionLabel = "block text-[10px] uppercase tracking-[0.15em] text-white/75";
const actionValue = "block text-sm font-semibold text-white";

export default function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 grid gap-[90px] bg-ink px-8 pt-25 pb-16 text-[#fffaf5] max-md:flex max-md:flex-col max-md:gap-10 max-md:px-5 max-md:pt-19 md:grid-cols-2">
      <div className="max-w-[500px]">
        <p style={{color: "#e8b3c4"}} className={`${eyebrow}`}>06 · Kontakt</p>
        <h2 className="mb-4 font-serif text-[clamp(38px,4vw,57px)] leading-none tracking-[-2px] text-[#fffaf5]">Posjetite nas</h2>
        <p className="text-[15px] leading-[1.7] text-[#c8b8b0]">Dođite da se upoznamo — vrata su vam uvijek otvorena.</p>
        <div className="my-9.5 flex flex-col gap-5">
          <span className="grid grid-cols-[23px_1fr] gap-x-2.25">
            <MapPin className="row-span-2 size-3.75 text-[#e8b3c4]" />
            <strong className="text-[13px] font-medium">Tuzi, Montenegro</strong>
            <small className="mt-0.75 text-[11px] text-[#a8958c]">Google Maps plus code · 986H+GW9</small>
          </span>
          <span className="grid grid-cols-[23px_1fr] gap-x-2.25">
            <Clock className="row-span-2 size-3.75 text-[#e8b3c4]" />
            <strong className="text-[13px] font-medium">Otvoreno svakog dana</strong>
            <small className="mt-0.75 text-[11px] text-[#a8958c]">09:00 – 22:00</small>
          </span>
          <span className="grid grid-cols-[23px_1fr] gap-x-2.25">
            <Phone className="row-span-2 size-3.75 text-[#e8b3c4]" />
            <strong className="text-[13px] font-medium">068 210 652</strong>
            <small className="mt-0.75 text-[11px] text-[#a8958c]">Viber · +382 68 210 652</small>
          </span>
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
          href="https://www.google.com/maps/place/Fantazija/@42.3612236,19.32961,17z/data=!4m6!3m5!1s0x134def0051223069:0x21ed72c244e862f1!8m2!3d42.3611983!4d19.3299411!16s%2Fg%2F11vwzfp79n?entry=ttu&g_ep=EgoyMDI2MTAyOC4wIKXMDSoASAFQAw%3D%3D"
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
