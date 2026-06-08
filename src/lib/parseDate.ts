export const parseDate = (d: string | null | undefined): number => {
  if (!d) return Infinity;
  const year = new Date().getFullYear();
  const dt = new Date(`${d} ${year}`);
  if (isNaN(dt.getTime())) return Infinity;
  if (dt < new Date()) dt.setFullYear(year + 1);
  return dt.getTime();
};
