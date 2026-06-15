export const parseDate = (d: string | null | undefined, countdownDatetime?: string | null): number => {
  // Use exact ISO datetime if available
  if (countdownDatetime) {
    const exact = new Date(countdownDatetime);
    if (!isNaN(exact.getTime())) return exact.getTime();
  }
  // Fallback: parse display date string
  if (!d) return Infinity;
  const year = new Date().getFullYear();
  const dt = new Date(`${d} ${year}`);
  if (isNaN(dt.getTime())) return Infinity;
  if (dt < new Date()) dt.setFullYear(year + 1);
  return dt.getTime();
};
