import { getTranslations } from "next-intl/server";
import LoaderView from "@/components/LoaderView";

// Loader za prelazak između stranica (loading.js).
export default async function Loader() {
  const t = await getTranslations("Loader");
  return <LoaderView label={t("loading")} />;
}
