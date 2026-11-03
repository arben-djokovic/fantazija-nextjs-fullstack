export const pickupTimes = Array.from({ length: 14 }, (_, i) => `${String(i + 9).padStart(2, "0")}:00`);

// Datum se računa po lokalnom vremenu, da ne bi pomjerio dan u ponoć.
export function tomorrowISO() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// Današnji datum u Crnoj Gori kao "YYYY-MM-DD", bez obzira na vremensku zonu servera.
export function todayInPodgorica() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Podgorica" }).format(new Date());
}

// "2026-11-03" + 1 -> "2026-11-04"
export function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
