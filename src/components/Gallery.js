import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { eyebrow, section, sectionTitle, textLink } from "@/components/styles";

// Slike iz lokala (public/assets). Dvije su uspravne i zauzimaju po dva reda, a dvije položene stoje jedna ispod druge.
// position: koji dio slike ostaje vidljiv kad se isječe.
const photos = [
  { key: "pastries", src: "/assets/kolaci.jpeg", place: "row-span-2", position: "object-[center_60%]" },
  {
    key: "counter",
    src: "/assets/sank.jpeg",
    place: "col-start-2 row-start-1 row-span-2 md:col-start-3",
    position: "object-[center_70%]",
  },
  { key: "interior", src: "/assets/lokal.jpeg", place: "col-start-1 row-start-3 md:col-start-2 md:row-start-1", position: "object-center" },
  { key: "wedding", src: "/assets/torta.png", place: "col-start-2 row-start-3 md:col-start-2 md:row-start-2", position: "object-[center_70%]" },
];

export default async function Gallery() {
  const t = await getTranslations("Gallery");

  return (
    <section id="gallery" className={`${section} scroll-mt-24`}>
      <div className="mb-8 flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className={eyebrow}>{t("eyebrow")}</p>
          <h2 className={sectionTitle}>{t("title")}</h2>
          <p className="leading-relaxed text-muted">{t("subtitle")}</p>
        </div>
        <a href="https://www.instagram.com/fantazija20/" target="_blank" rel="noreferrer" className={`${textLink} hidden md:inline-flex`}>
          @fantazija20 <ArrowRight className="size-4" />
        </a>
      </div>

      <div className="grid grid-cols-2 grid-rows-[150px_150px_160px] gap-2 md:grid-cols-[0.9fr_1.3fr_0.9fr] md:grid-rows-[190px_190px] md:gap-3">
        {photos.map((photo) => (
          <div key={photo.key} className={`relative overflow-hidden rounded-xl ${photo.place}`}>
            <Image src={photo.src} alt={t(`photos.${photo.key}`)} fill sizes="(min-width: 768px) 40vw, 50vw" className={`object-cover ${photo.position}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
