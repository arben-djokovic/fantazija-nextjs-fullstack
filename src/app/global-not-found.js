import Image from "next/image";
import { headers } from "next/headers";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { languages } from "@/data/languages";
import "./globals.css";

// Ova stranica nije u [locale], pa jezik i adresu čita iz headera koje postavlja proxy (npr. /en/abc -> en, /abc).
async function getRequestInfo() {
  const headerList = await headers();
  const requested = headerList.get("x-next-intl-locale");
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const [, first, ...rest] = (headerList.get("x-pathname") ?? "/").split("/");
  const segments = hasLocale(routing.locales, first) ? rest : [first, ...rest];
  return { locale, pathname: `/${segments.join("/")}` };
}

export async function generateMetadata() {
  const { locale } = await getRequestInfo();
  const t = await getTranslations({ locale, namespace: "NotFound" });
  return {
    title: `404 · ${t("title")}`,
    description: t("text"),
  };
}

// Ovu stranicu Next.js prikazuje za adrese koje ne postoje, pa mora imati sopstveni <html> i <body>.
// Linkovi su obični <a>: ova stranica je van Next routera, pa bi <Link> promijenio samo URL bez nove stranice.
export default async function GlobalNotFound() {
  const { locale, pathname } = await getRequestInfo();
  const t = await getTranslations({ locale, namespace: "NotFound" });
  const tHeader = await getTranslations({ locale, namespace: "Header" });

  return (
    <html lang={locale}>
      <body className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-cream text-ink">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {languages.map((language) => (
            <a
              key={language.code}
              href={getPathname({ href: pathname, locale: language.code })}
              aria-label={tHeader(`languageNames.${language.code}`)}
              aria-current={locale === language.code ? "true" : undefined}
              className={`rounded-sm p-0.5 transition-opacity ${
                locale === language.code ? "opacity-100 ring-2 ring-pink-500" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={language.flag} alt="" width={20} height={15} className="h-4 w-6 object-cover" />
            </a>
          ))}
        </div>
        <p className="font-serif text-7xl leading-none">404</p>
        <p className="text-sm text-muted">{t("text")}</p>
        <a href={getPathname({ href: "/", locale })} className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white">
          {t("back")}
        </a>
      </body>
    </html>
  );
}
