// Turns shape-checked cart lines into the order's `items`, with names and prices read
// from the database (never trusted from the browser). Shared by create-order (website
// checkout) and admin-create-order (manual bookings), so both store identical lines.
// No Deno / network code here, so vitest can test it with a stub client.

import { linePaise, type CartLine } from "./orderPricing.ts";

// IDs like "puja-<uuid>-<tier label (may contain spaces or hyphens)>"
const PUJA_ID_RE = /^puja-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-(.+)$/i;
// IDs like "chadhava-<chadhava_offerings uuid>"
const CHADHAVA_ID_RE = /^chadhava-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
// IDs like "offering-<puja_offerings uuid>"
const OFFERING_ID_RE = /^offering-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export const BLESSING_BOX_PRICE = 200; // matches the frontend constant (Checkout.tsx)

export interface PricedItem {
  id: string;
  category: string;
  quantity: number;
  name: string;
  price: number;
  verified: true;
  [key: string]: unknown;
}

export type PricedResult =
  | { ok: true; items: PricedItem[]; totalPaise: number }
  | { ok: false; status: number; error: string; code?: "ITEM_UNAVAILABLE"; item_id?: string };

const bad = (error: string): PricedResult => ({ ok: false, status: 400, error });
/** An item that can no longer be booked (inactive, deleted, package renamed). */
const unavailable = (error: string, itemId: string): PricedResult =>
  ({ ok: false, status: 409, error, code: "ITEM_UNAVAILABLE", item_id: itemId });

// deno-lint-ignore no-explicit-any
export async function priceOrderLines(supabase: any, lines: CartLine[]): Promise<PricedResult> {
  let totalPaise = 0;
  const items: PricedItem[] = [];

  // Only the shape-checked fields of each line are used; names and prices come from the DB.
  for (const item of lines) {
    const base = { id: item.id, category: item.category, quantity: item.quantity };

    // ── Puja tier ──
    if (item.category === "puja") {
      const match = PUJA_ID_RE.exec(item.id);
      if (!match) return bad(`Invalid pooja item ID format: ${item.id}`);
      const [, pujaId, tierLabel] = match;

      const { data: puja } = await supabase
        .from("pujas")
        .select("name, prices, date, location")
        .eq("id", pujaId)
        .eq("status", "active")
        .maybeSingle();

      if (!puja) return unavailable(`"${item.name}" is no longer available for booking`, item.id);

      const tier = ((puja.prices ?? []) as { label: string; price: number }[])
        .find((t) => t.label === tierLabel);
      if (!tier) return unavailable(`The "${tierLabel}" package of ${puja.name} has changed. Please choose it again.`, item.id);

      totalPaise += linePaise(tier.price, item.quantity);
      // Snapshot WHICH puja was booked. Several pujas can share a name (same puja on
      // different dates), and a puja may be edited or deleted later — the order must
      // keep its own record of the date and place the customer paid for.
      items.push({
        ...base,
        name: `${puja.name} (${tierLabel})`,
        price: tier.price,
        verified: true,
        puja_id: pujaId.toLowerCase(),
        puja_name: puja.name,
        puja_date: puja.date ?? null,
        puja_location: puja.location ?? null,
        tier: tierLabel,
      });

    // ── Chadhava offering ──
    } else if (item.category === "chadhava") {
      const match = CHADHAVA_ID_RE.exec(item.id);
      if (!match) return bad(`Invalid chadhava item ID format: ${item.id}`);
      const [, offeringId] = match;

      const { data: offering } = await supabase
        .from("chadhava_offerings")
        .select("name, price, chadhava_id, chadhavas(temple, date)")
        .eq("id", offeringId)
        .eq("status", "active")
        .maybeSingle();

      if (!offering) return unavailable(`"${item.name}" is no longer available`, item.id);

      totalPaise += linePaise(offering.price, item.quantity);
      const chadhava = (Array.isArray(offering.chadhavas) ? offering.chadhavas[0] : offering.chadhavas) as
        | { temple?: string | null; date?: string | null }
        | null
        | undefined;
      items.push({
        ...base,
        name: offering.name,
        price: offering.price,
        verified: true,
        chadhava_id: offering.chadhava_id ?? null,
        chadhava_temple: chadhava?.temple ?? null,
        chadhava_date: chadhava?.date ?? null,
      });

    // ── Puja add-on offering ──
    } else if (item.category === "offering") {
      const match = OFFERING_ID_RE.exec(item.id);
      if (!match) return bad(`Invalid offering item ID format: ${item.id}`);
      const [, offeringId] = match;

      const { data: offering } = await supabase
        .from("puja_offerings")
        .select("name, price, puja_id")
        .eq("id", offeringId)
        .eq("status", "active")
        .maybeSingle();

      if (!offering) return unavailable(`"${item.name}" is no longer available`, item.id);

      totalPaise += linePaise(offering.price, item.quantity);
      items.push({ ...base, name: offering.name, price: offering.price, verified: true, puja_id: offering.puja_id ?? null });

    // ── Blessing box (fixed price, no DB record) ──
    } else if (item.category === "addon" && item.id === "blessing-box") {
      totalPaise += linePaise(BLESSING_BOX_PRICE, item.quantity);
      items.push({ ...base, name: "Narayan Kripa Blessing Box", price: BLESSING_BOX_PRICE, verified: true });

    // ── Unknown add-on — reject to avoid price manipulation ──
    } else {
      return bad(`Unknown item: ${item.id}`);
    }
  }

  return { ok: true, items, totalPaise };
}

/** Sankalp details: trimmed gotra and member names, empty names dropped, lengths capped. */
export function cleanPujaDetails(raw: unknown): { gotra: string; member_names: string[] } | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { gotra?: unknown; member_names?: unknown };
  const tidy = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
  const member_names = Array.isArray(r.member_names)
    ? r.member_names.map((n) => tidy(n, 100)).filter(Boolean).slice(0, 12)
    : [];
  return { gotra: tidy(r.gotra, 100), member_names };
}
