/* Checks shared by the admin forms, so a bad value is stopped with a clear message. */

/** Prices are whole rupees, at least ₹1 (the columns are integers; 0 and negatives can't be bought). */
export const isWholeRupees = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 1;

export const PRICE_RULE = "must be a whole number of rupees, 1 or more";

/**
 * The problem with a pooja's package tiers, or null. Labels must be unique: an order
 * names its tier by label and the server charges the first tier with that label, so two
 * "Couple" tiers would charge the second one's buyers the first one's price.
 */
export function tierProblem(tiers: { label: string; price: number }[] | null | undefined): string | null {
  if (!tiers?.length) return "Add at least one package tier.";
  const seen = new Set<string>();
  for (const [i, t] of tiers.entries()) {
    const label = t.label.trim();
    if (!label) return `Package tier ${i + 1} needs a name.`;
    if (!isWholeRupees(t.price)) return `The price of "${label}" ${PRICE_RULE}.`;
    const key = label.toLowerCase();
    if (seen.has(key)) return `Two package tiers are called "${label}". Give each tier a different name.`;
    seen.add(key);
  }
  return null;
}

/** The first empty required field's name, or null. */
export function missingField(fields: [label: string, value: string | null | undefined][]): string | null {
  return fields.find(([, v]) => !v?.trim())?.[0] ?? null;
}

/** True when a form copy differs from what was loaded into it. */
export const isDirty = (current: unknown, original: unknown): boolean => JSON.stringify(current) !== JSON.stringify(original);

/** Number typed into a price box: keeps what was typed, empty while the box is cleared. */
export const priceInput = (raw: string): number => (raw.trim() === "" ? 0 : Number(raw));
