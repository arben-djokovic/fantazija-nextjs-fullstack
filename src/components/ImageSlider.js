"use client";

import { useImperativeHandle, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { canOptimize } from "@/lib/images";

// Slike proizvoda jedna do druge sa scroll-snap: na telefonu se prevlači prstom, na desktopu strelice.
// ref.current.show(index) pomjera slider na sliku (koristi se kad kupac izabere opciju sa svojom slikom).
export default function ImageSlider({ ref, images, alt }) {
  const t = useTranslations("Products");
  const trackRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const many = images.length > 1;

  const show = (index) => {
    const track = trackRef.current;
    if (!track || index < 0 || index >= images.length) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  useImperativeHandle(ref, () => ({ show }));

  const handleScroll = () => {
    const track = trackRef.current;
    if (track) setCurrent(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={many ? handleScroll : undefined}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={index === 0 ? alt : `${alt} (${index + 1}/${images.length})`}
            width={800}
            height={600}
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
            unoptimized={!canOptimize(src)}
            className="aspect-4/3 h-auto w-full shrink-0 snap-start object-cover"
          />
        ))}
      </div>

      {many && (
        <>
          <button
            type="button"
            aria-label={t("previousImage")}
            onClick={() => show(current - 1)}
            disabled={current === 0}
            className="absolute top-1/2 left-2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-card/90 text-ink shadow transition-colors hover:bg-card disabled:invisible"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label={t("nextImage")}
            onClick={() => show(current + 1)}
            disabled={current === images.length - 1}
            className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-card/90 text-ink shadow transition-colors hover:bg-card disabled:invisible"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5">
            {images.map((src, index) => (
              <button
                key={src}
                type="button"
                aria-label={t("showImage", { number: index + 1 })}
                aria-current={index === current}
                onClick={() => show(index)}
                className={`h-1.5 rounded-full shadow transition-all ${index === current ? "w-4 bg-white" : "w-1.5 bg-white/60"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
