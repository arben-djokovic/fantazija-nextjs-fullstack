import { getTranslations } from "next-intl/server";
import { FOUNDED_YEAR, INSTAGRAM_URL, MAPS_URL } from "@/data/contact";
import { LANGUAGE_TAGS, SITE_NAME, SITE_URL, localizedUrl } from "@/lib/seo";

// Strukturirani podaci za Google: poslastičarnica, adresa, radno vrijeme, telefon.
// Pomaže da se Fantazija pojavi kao lokalni biznis u pretrazi i na mapama.
export default async function LocalBusinessJsonLd({ locale }) {
  const t = await getTranslations({ locale, namespace: "Metadata.home" });

  const data = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${SITE_URL}/#bakery`,
    name: SITE_NAME,
    alternateName: t("title"),
    description: t("description"),
    url: localizedUrl("/", locale),
    inLanguage: LANGUAGE_TAGS[locale],
    logo: `${SITE_URL}/icon.png`,
    image: `${SITE_URL}/og-image.png`,
    telephone: "+38268210652",
    foundingDate: String(FOUNDED_YEAR),
    priceRange: "€",
    servesCuisine: "Desserts",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tuzi",
      addressCountry: "ME",
    },
    geo: { "@type": "GeoCoordinates", latitude: 42.3611983, longitude: 19.3299411 },
    hasMap: MAPS_URL,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "09:00",
        closes: "22:00",
      },
    ],
    sameAs: [INSTAGRAM_URL],
  };

  return (
    <script
      type="application/ld+json"
      // "<" se escape-uje da tekst iz prevoda ne može zatvoriti <script> tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
