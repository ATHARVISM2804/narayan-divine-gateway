import { supabase } from "@/lib/supabase";
import type { CartItem } from "@/context/CartContext";

/*
 * The cart lives in localStorage and can be days old. If the admin has since
 * deactivated a puja, renamed a package or changed a price, create-order rejects the
 * line or charges a different amount than the page shows — which customers read as
 * "payment is broken". Checkout re-checks the cart against the live catalog first.
 */

const PUJA_RE = /^puja-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-(.+)$/i;
const CHADHAVA_RE = /^chadhava-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export interface CatalogPuja { id: string; prices: { label: string; price: number }[] | null }
export interface CatalogOffering { id: string; price: number }

export interface CartChanges {
  remove: string[];
  reprice: { id: string; price: number }[];
}

/** Pure: which cart lines are gone and which have a new price, given the live catalog. */
export function diffCart(items: CartItem[], pujas: CatalogPuja[], offerings: CatalogOffering[]): CartChanges {
  const pujaById = new Map(pujas.map((p) => [p.id.toLowerCase(), p]));
  const offeringById = new Map(offerings.map((o) => [o.id.toLowerCase(), o]));
  const changes: CartChanges = { remove: [], reprice: [] };

  for (const item of items) {
    let current: number | undefined;
    const puja = PUJA_RE.exec(item.id);
    const chadhava = CHADHAVA_RE.exec(item.id);
    if (item.category === "puja" && puja) {
      current = pujaById.get(puja[1].toLowerCase())?.prices?.find((t) => t.label === puja[2])?.price;
    } else if (item.category === "chadhava" && chadhava) {
      current = offeringById.get(chadhava[1].toLowerCase())?.price;
    } else {
      continue; // unknown shape — leave it to the server to judge
    }
    if (current === undefined) changes.remove.push(item.id);
    else if (Number(current) !== item.price) changes.reprice.push({ id: item.id, price: Number(current) });
  }
  return changes;
}

/**
 * Fetches the live catalog for the cart's lines and returns what changed.
 * Returns null if the catalog could not be read — never drop items on a failed lookup.
 */
export async function checkCartAgainstCatalog(items: CartItem[]): Promise<CartChanges | null> {
  const pujaIds = [...new Set(items.map((i) => PUJA_RE.exec(i.id)?.[1]).filter(Boolean) as string[])];
  const offeringIds = [...new Set(items.map((i) => CHADHAVA_RE.exec(i.id)?.[1]).filter(Boolean) as string[])];
  if (pujaIds.length === 0 && offeringIds.length === 0) return { remove: [], reprice: [] };

  try {
    const [pujaRes, offeringRes] = await Promise.all([
      pujaIds.length
        ? supabase.from("pujas").select("id, prices").in("id", pujaIds).eq("status", "active")
        : Promise.resolve({ data: [], error: null }),
      offeringIds.length
        ? supabase.from("chadhava_offerings").select("id, price").in("id", offeringIds).eq("status", "active")
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (pujaRes.error || offeringRes.error) return null;
    return diffCart(items, (pujaRes.data ?? []) as CatalogPuja[], (offeringRes.data ?? []) as CatalogOffering[]);
  } catch {
    return null;
  }
}
