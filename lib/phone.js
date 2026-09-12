// Normalizes an Egyptian phone number into the international digits-only
// format that wa.me links require (e.g. "01554454812" -> "201554454812").
// Accepts numbers already in international format ("20...", "+20...") too.
export function toWhatsAppNumber(raw) {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("0")) return `20${digits.slice(1)}`;
  return digits;
}
