"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { languages } from "@/data/languages";

const navLinks = [
  { href: "/", key: "home" },
  { href: "/offer", key: "offer" },
  { href: "/#gallery", key: "gallery" },
  { href: "/#about", key: "about" },
  { href: "/#contact", key: "contact" },
];

function Logo({ alt, tagline }) {
  return (
    <Link href="/" className="flex w-36 flex-col items-center justify-center">
      <Image src="/logo.e0e08eb7d04655a6ddaf.png" alt={alt} width={100} height={40} priority className="h-12 md:h-13 w-auto object-contain" />
      <span className="whitespace-nowrap text-center text-[8px] tracking-[0.15em] text-zinc-800">{tagline}</span>
    </Link>
  );
}

export default function Header() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95">
      <div style={{justifyContent: "space-between"}} className="mx-auto flex w-full items-center justify-between px-4 py-3 md:px-8">
        <Logo alt={t("logoAlt")} tagline={t("tagline")} />

        <nav className="hidden flex-1 justify-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-md tracking-wide text-zinc-800 transition-colors hover:text-pink-600"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            {languages.map((language) => (
              <Link
                key={language.code}
                href={pathname}
                locale={language.code}
                aria-label={t(`languageNames.${language.code}`)}
                aria-pressed={locale === language.code}
                className={`rounded-sm p-0.5 transition-opacity ${
                  locale === language.code ? "opacity-100 ring-2 ring-pink-500" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={language.flag} alt="" width={20} height={15} className="h-4 w-6 object-cover cursor-pointer" />
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
            className="rounded-md p-2 text-zinc-800 md:hidden cursor-pointer "
          >
            {menuOpen ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col bg-white/95 px-4 pb-4 shadow-md backdrop-blur md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-2 text-sm uppercase tracking-wide text-zinc-500 cursor-pointer"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
