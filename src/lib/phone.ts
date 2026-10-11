/**
 * Indian mobile number → its 10 digits, or null. Accepts the forms people paste or that
 * older leads stored: "+91 98765 43210", "919876543210", "09876543210", "98765-43210".
 */
export function normaliseIndianMobile(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export const isValidIndianMobile = (raw: string) => /^[6-9]\d{9}$/.test(raw);
