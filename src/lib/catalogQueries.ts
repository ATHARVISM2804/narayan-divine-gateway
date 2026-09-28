import type { Chadhava, ChadhavaOffering, Puja, Temple } from "@/lib/supabase";
import type { Snapshot } from "@/lib/catalog";

/** Only what the listing cards show — the full rows carry large FAQ/about JSON. */
export const PUJA_CARD_COLUMNS =
  "id,name,name_hi,date,countdown_datetime,location,location_hi,benefit,benefit_hi,image_url,featured,prices,status";

export const CHADHAVA_CARD_COLUMNS =
  "id,item,item_hi,temple,temple_hi,description,description_hi,date,countdown_datetime,price,image_url,featured,status,created_at";

/* The snapshot (scripts/snapshot-catalog.mjs) holds only active rows. */

export const activePujasFromSnapshot = (s: Snapshot) => (s.pujas as Puja[] | undefined) ?? null;

export const featuredPujasFromSnapshot = (s: Snapshot) =>
  (s.pujas as Puja[] | undefined)?.filter((p) => p.featured) ?? null;

export const pujaFromSnapshot = (id: string) => (s: Snapshot) =>
  (s.pujas as Puja[] | undefined)?.find((p) => p.id === id) ?? null;

export interface ChadhavaList { chadhavas: Chadhava[]; minPrices: Record<string, number> }

export function minOfferingPrices(offerings: { chadhava_id: string; price: number }[]): Record<string, number> {
  const mins: Record<string, number> = {};
  for (const o of offerings) {
    if (mins[o.chadhava_id] === undefined || o.price < mins[o.chadhava_id]) mins[o.chadhava_id] = o.price;
  }
  return mins;
}

export const chadhavaListFromSnapshot = (s: Snapshot): ChadhavaList | null =>
  s.chadhavas
    ? {
        chadhavas: s.chadhavas as Chadhava[],
        minPrices: minOfferingPrices((s.chadhava_offerings as ChadhavaOffering[] | undefined) ?? []),
      }
    : null;

export const featuredChadhavasFromSnapshot = (s: Snapshot) =>
  (s.chadhavas as Chadhava[] | undefined)
    ?.filter((c) => c.featured)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 3) ?? null;

export interface ChadhavaWithOfferings { chadhava: Chadhava; offerings: ChadhavaOffering[] }

export const chadhavaFromSnapshot = (id: string) => (s: Snapshot): ChadhavaWithOfferings | null => {
  const chadhava = (s.chadhavas as Chadhava[] | undefined)?.find((c) => c.id === id);
  if (!chadhava) return null;
  const offerings = ((s.chadhava_offerings as ChadhavaOffering[] | undefined) ?? [])
    .filter((o) => o.chadhava_id === id)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return { chadhava, offerings };
};

export const templesFromSnapshot = (s: Snapshot) =>
  (s.temples as Temple[] | undefined)?.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) ?? null;
