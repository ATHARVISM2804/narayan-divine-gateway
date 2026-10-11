// supabase/functions/_shared/orderPricing.ts
// Shape checks for what the browser sends to create-order, before any price lookup.
// Pure (no Deno / DB) so it can be unit-tested from vitest.
//
// Prices always come from the database; these checks stop the request from bending
// the total in other ways — negative or fractional quantities, duplicated lines,
// add-ons without the puja they belong to.

export const MAX_LINES = 30;
export const MAX_QTY = 10;

export type ItemCategory = "puja" | "chadhava" | "offering" | "addon";

export interface CartLine {
  id: string;
  category: ItemCategory;
  quantity: number;
  /** Client-side label — only used in error messages; the stored name comes from the DB. */
  name: string;
}

export type LinesResult = { ok: true; lines: CartLine[] } | { ok: false; error: string };

const CATEGORIES: ItemCategory[] = ["puja", "chadhava", "offering", "addon"];

/** Validates and normalises the cart lines. A missing quantity means 1. */
export function validateCartLines(items: unknown): LinesResult {
  if (!Array.isArray(items) || items.length === 0) return { ok: false, error: "Cart is empty" };
  if (items.length > MAX_LINES) return { ok: false, error: "Too many items in cart" };

  const lines: CartLine[] = [];
  const seen = new Set<string>();
  for (const raw of items) {
    if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid cart item" };
    const r = raw as Record<string, unknown>;
    const id = typeof r.id === "string" ? r.id : "";
    const category = r.category as ItemCategory;
    const name = typeof r.name === "string" ? r.name.slice(0, 200) : id;

    if (!id || id.length > 300) return { ok: false, error: "Invalid cart item" };
    if (!CATEGORIES.includes(category)) return { ok: false, error: `Unknown item category: ${String(r.category)}` };
    if (seen.has(id)) return { ok: false, error: `Duplicate cart item: ${name}` };
    seen.add(id);

    const quantity = r.quantity === undefined || r.quantity === null ? 1 : r.quantity;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
      return { ok: false, error: `Invalid quantity for ${name}` };
    }
    // Add-ons are a single unit on top of a puja; pujas and chadhavas can be booked a few times.
    const max = category === "offering" || category === "addon" ? 1 : MAX_QTY;
    if (quantity > max) return { ok: false, error: `Invalid quantity for ${name}` };

    lines.push({ id, category, quantity, name });
  }

  const hasPuja = lines.some((l) => l.category === "puja");
  if (!hasPuja && lines.some((l) => l.category === "offering" || l.category === "addon")) {
    return { ok: false, error: "Add-ons need a puja in the cart" };
  }
  return { ok: true, lines };
}

/** Rupee price × quantity in paise. Throws on a price that isn't a sane non-negative number. */
export function linePaise(priceRupees: unknown, quantity: number): number {
  const price = Number(priceRupees);
  if (!Number.isFinite(price) || price < 0) throw new Error(`Invalid price: ${String(priceRupees)}`);
  return Math.round(price * 100) * quantity;
}

/** Loose server-side check (NRI numbers allowed): 10–15 digits once formatting is stripped. */
export function isPlausiblePhone(raw: unknown): boolean {
  if (typeof raw !== "string" || raw.length > 20) return false;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/** Razorpay notes allow 256 chars per value; keep a margin. */
export const noteValue = (v: unknown, max = 200): string => (typeof v === "string" ? v.slice(0, max) : "");
