import { cacheLife } from "next/cache";

// Trenutna godina u Crnoj Gori. Keširana na dan, jer Next ne dozvoljava new Date() pri pravljenju stranice.
export async function currentYear() {
  "use cache";
  cacheLife("days");
  return Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Europe/Podgorica" }).format(new Date()));
}
