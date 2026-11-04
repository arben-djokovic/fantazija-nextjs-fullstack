import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

// Glavna adresa sajta. Na produkciji postaviti NEXT_PUBLIC_SITE_URL (npr. https://fantazija.me).
// Na Vercelu se bez nje koristi produkcijski domen projekta.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "Fantazija";

// "me" nije ISO kod jezika, pa ga Google ne bi prepoznao. Za <html lang> i hreflang koristimo sr-ME.
export const LANGUAGE_TAGS = { me: "sr-ME", sq: "sq", en: "en" };
const OG_LOCALES = { me: "sr_ME", sq: "sq_AL", en: "en_US" };

// Slika koja se prikazuje kad neko podijeli link (Facebook, Viber, WhatsApp): logo na krem pozadini, 1200x630.
const OG_IMAGE = {
  url: `${SITE_URL}/og-image.png`,
  width: 1200,
  height: 630,
  type: "image/png",
};

export function localizedUrl(href, locale) {
  const path = getPathname({ href, locale });
  return `${SITE_URL}${path === "/" ? "" : path}`;
}

// Linkovi na istu stranicu na svim jezicima (hreflang), x-default vodi na crnogorski.
export function languageAlternates(href) {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [LANGUAGE_TAGS[locale], localizedUrl(href, locale)])
  );
  languages["x-default"] = localizedUrl(href, routing.defaultLocale);
  return languages;
}

// Kompletni metadata za jednu javnu stranicu: title, description, keywords, canonical, hreflang i Open Graph.
export async function pageMetadata({ locale, href, namespace, absoluteTitle = false, index = true }) {
  const t = await getTranslations({ locale, namespace: `Metadata.${namespace}` });
  const title = t("title");
  const description = t("description");
  const url = localizedUrl(href, locale);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: t.has("keywords") ? t("keywords").split(",").map((k) => k.trim()) : undefined,
    alternates: { canonical: url, languages: languageAlternates(href) },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: OG_LOCALES[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
      images: [{ ...OG_IMAGE, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
  };
}
