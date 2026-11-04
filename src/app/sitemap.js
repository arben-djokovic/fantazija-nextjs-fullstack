import { routing } from "@/i18n/routing";
import { languageAlternates, localizedUrl } from "@/lib/seo";

// Javne stranice koje Google treba da indeksira. Korpa i galerija (još prazna) su namjerno izostavljene.
const PAGES = [
  { href: "/", changeFrequency: "weekly", priority: 1 },
  { href: "/offer", changeFrequency: "weekly", priority: 0.9 },
  { href: "/cake-builder", changeFrequency: "monthly", priority: 0.8 },
];

export default function sitemap() {
  return PAGES.flatMap(({ href, changeFrequency, priority }) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(href, locale),
      changeFrequency,
      priority,
      alternates: { languages: languageAlternates(href) },
    }))
  );
}
