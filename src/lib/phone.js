// Broj telefona u međunarodnom formatu, sa Crnom Gorom (+382) kao podrazumijevanom zemljom.
// "067 123 456" -> "+38267123456", "00382..." -> "+382...", "38267..." -> "+38267...", "+49..." ostaje kakav jeste.
export function normalizePhone(phone) {
  const cleaned = String(phone ?? "").replace(/[\s\-().]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("00")) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith("382")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+382${cleaned.slice(1)}`;
  return `+382${cleaned}`; // broj bez nule i pozivnog ("67123456")
}
