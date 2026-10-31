export const pickupTimes = Array.from({ length: 14 }, (_, i) => `${String(i + 9).padStart(2, "0")}:00`);

// Datum se računa po lokalnom vremenu, da ne bi pomjerio dan u ponoć.
export function tomorrowISO() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
