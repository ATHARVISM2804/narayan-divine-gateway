// Admin → New Booking: turns what the admin picked into the same cart lines a website
// checkout sends, so admin-create-order prices and stores them exactly like create-order.

export const BLESSING_BOX_PRICE = 200; // same as Checkout.tsx and the server

export interface Tier { label: string; price: number }
export interface PriceRow { id: string; name: string; price: number }

export interface BookingSelection {
  puja: { id: string; tier: Tier; addons: PriceRow[] } | null;
  blessingBox: boolean;
  /** Chadhava offerings with their chosen quantity (0 = not chosen). */
  chadhava: { offerings: (PriceRow & { qty: number })[] } | null;
}

export interface CartLine { id: string; category: "puja" | "chadhava" | "offering" | "addon"; quantity: number; name: string }

/** The lines sent to admin-create-order (the server reads prices from the database). */
export function bookingLines(sel: BookingSelection): CartLine[] {
  const lines: CartLine[] = [];
  if (sel.puja) {
    lines.push({ id: `puja-${sel.puja.id}-${sel.puja.tier.label}`, category: "puja", quantity: 1, name: sel.puja.tier.label });
    for (const a of sel.puja.addons) lines.push({ id: `offering-${a.id}`, category: "offering", quantity: 1, name: a.name });
    if (sel.blessingBox) lines.push({ id: "blessing-box", category: "addon", quantity: 1, name: "Narayan Kripa Blessing Box" });
  }
  for (const o of sel.chadhava?.offerings ?? []) {
    if (o.qty > 0) lines.push({ id: `chadhava-${o.id}`, category: "chadhava", quantity: o.qty, name: o.name });
  }
  return lines;
}

/** Catalog total in rupees, as shown before saving (the server recomputes it). */
export function bookingTotal(sel: BookingSelection): number {
  let total = 0;
  if (sel.puja) {
    total += sel.puja.tier.price + sel.puja.addons.reduce((s, a) => s + a.price, 0);
    if (sel.blessingBox) total += BLESSING_BOX_PRICE;
  }
  for (const o of sel.chadhava?.offerings ?? []) total += o.price * o.qty;
  return total;
}

/** How many sankalp names a package takes. Same rule as Checkout's getMemberCount. */
export function memberCountFor(tierLabel: string): number {
  const l = tierLabel.toLowerCase();
  if (l.includes("6") || l.includes("joint")) return 6;
  if (l.includes("4") || l.includes("family")) return 4;
  if (l.includes("couple") || l.includes("2")) return 2;
  return 1;
}

/** "Rudrabhishek · 21 Oct · Kashi": what the admin sees in the pooja / chadhava dropdown. */
export const optionLabel = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(" · ");

/**
 * Best match for a lead's pooja and package among the active poojas: leads store names,
 * not ids, so the same name and the soonest date win.
 */
export function matchLeadPuja<P extends { id: string; name: string; prices: Tier[] | null }>(
  pujas: P[],
  pujaName: string | null | undefined,
  packageLabel: string | null | undefined,
): { puja: P; tier: Tier | null } | null {
  const want = (pujaName ?? "").trim().toLowerCase();
  if (!want) return null;
  const puja = pujas.find((p) => p.name.trim().toLowerCase() === want);
  if (!puja) return null;
  const label = (packageLabel ?? "").trim().toLowerCase();
  const tier = (puja.prices ?? []).find((t) => t.label.trim().toLowerCase() === label) ?? null;
  return { puja, tier };
}

/**
 * What the mobile field keeps while typing or pasting: digits only, without a +91 or 0
 * prefix ("+91 98765 43210" → "9876543210"), at most 10 digits.
 */
export function mobileInput(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.length > 10 && d.startsWith("91")) d = d.slice(2);
  else if (d.length > 10 && d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 10);
}
