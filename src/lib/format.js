export function formatPrice(value) {
  const text = Number.isInteger(value) ? String(value) : value.toFixed(2).replace(".", ",");
  return `${text} €`;
}
