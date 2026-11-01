/* eslint-disable @next/next/no-img-element */
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { eyebrow, section, sectionTitle, textLink } from "@/components/styles";

const photos = [
  {
    key: "cake",
    src: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85",
    place: "row-span-2",
  },
  {
    key: "fruit",
    src: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85",
    place: "col-start-2",
  },
  {
    key: "pastries",
    src: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85",
    place: "col-start-2 row-start-2 md:col-start-3 md:row-start-1",
  },
  {
    key: "cream",
    src: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=85",
    place: "col-start-1 row-start-3 md:col-start-2 md:row-start-2",
  },
  {
    key: "wedding",
    src: "https://images.unsplash.com/photo-1519657337289-077653f724ed?auto=format&fit=crop&w=900&q=85",
    place: "col-start-2 row-start-3 md:col-start-3 md:row-start-2",
  },
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

      <div className="grid grid-cols-2 grid-rows-[180px_130px_130px] gap-2 md:grid-cols-[1.2fr_0.8fr_0.9fr] md:grid-rows-[170px_170px] md:gap-3">
        {photos.map((photo) => (
          <img key={photo.key} src={photo.src} alt={t(`photos.${photo.key}`)} className={`h-full w-full rounded-xl object-cover ${photo.place}`} />
        ))}
      </div>
    </section>
  );
}
