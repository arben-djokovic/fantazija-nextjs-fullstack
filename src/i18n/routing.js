import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["me", "sq", "en"],
  defaultLocale: "me",
  // Crnogorski je bez prefiksa (/), albanski i engleski imaju /sq i /en.
  localePrefix: "as-needed",
  // Ne prebacujemo korisnika po jeziku browsera, samo po izboru u headeru.
  localeDetection: false,
});
