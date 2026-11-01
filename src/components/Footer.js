import { getTranslations } from "next-intl/server";
import { Heart, Phone } from "lucide-react";
import { FaInstagram, FaViber } from "react-icons/fa6";
import { SiGooglemaps } from "react-icons/si";
import { Link } from "@/i18n/navigation";
import { INSTAGRAM_URL, MAPS_URL } from "@/data/contact";

export default async function Footer() {
  const t = await getTranslations("Footer");
  const tHeader = await getTranslations("Header");

  const socials = [
    { href: "tel:+38268210652", label: t("social.phone"), icon: Phone, color: "bg-[#0c024e]" },
    { href: MAPS_URL, label: t("social.maps"), icon: SiGooglemaps, color: "bg-[#4285F4]" },
    {
      href: INSTAGRAM_URL,
      label: t("social.instagram"),
      icon: FaInstagram,
      color: "bg-[linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)]",
    },
    { href: "viber://chat?number=%2B38268210652", label: t("social.viber"), icon: FaViber, color: "bg-[#7360F2]" },
  ];

  return (
    <footer className="border-t border-[#5e4c44] bg-ink text-[#fffaf5]">
      <div className="mx-auto max-w-7xl px-5 pt-12 pb-6 md:px-8 md:pt-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/" className="flex flex-col items-start">
              <span className="font-serif text-3xl italic text-[#f2c5d2]">Fantazija</span>
              <small className="mt-1 text-[8px] tracking-[0.3em]">{tHeader("tagline")}</small>
            </Link>
            <p className="mt-5 max-w-xs text-xs text-[#ad9a91]">{t("tagline")}</p>
          </div>

          <div className="flex flex-col gap-2 text-xs text-[#ad9a91]">
            <strong className="mb-1 font-medium text-[#fffaf5]">{t("contactTitle")}</strong>
            <span>{t("address")}</span>
            <span>068 210 652</span>
            <span>{t("hours")}</span>
          </div>

          <div className="flex gap-3">
            {socials.map(({ href, label, icon: Icon, color }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target={href.startsWith("https") ? "_blank" : undefined}
                rel={href.startsWith("https") ? "noreferrer" : undefined}
                className={`flex size-9 items-center justify-center rounded-full text-white transition-transform hover:-translate-y-0.5 md:size-10 ${color}`}
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[#5e4c44] pt-4 text-[10px] text-[#8e7b72] md:flex-row md:justify-between">
          <span>{t("copyright")}</span>
          <span className="hidden items-center gap-1.5 md:flex">
            {t("madeIn")} <Heart className="size-3 text-[#e8b3c4]" fill="currentColor" />
          </span>
        </div>
      </div>
    </footer>
  );
}
