// Crnogorski i albanski koriste zarez, engleski tačku.
export function formatPrice(value, locale = "me") {
  const separator = locale === "en" ? "." : ",";
  const text = Number.isInteger(value) ? String(value) : value.toFixed(2).replace(".", separator);
  return `${text} €`;
}
