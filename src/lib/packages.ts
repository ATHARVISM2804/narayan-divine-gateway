/** Members in a pooja package, read from its label ("Family (4)", "Couple"…); null if unclear. */
export const tierMembers = (label: string): number | null => {
  const n = label.match(/\d+/);
  if (n) return Number(n[0]);
  const l = label.toLowerCase();
  if (l.includes("joint")) return 6;
  if (l.includes("family")) return 4;
  if (l.includes("couple")) return 2;
  if (l.includes("single") || l.includes("individual")) return 1;
  return null;
};
