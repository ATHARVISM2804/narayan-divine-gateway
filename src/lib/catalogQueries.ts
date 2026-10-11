import { supabase, type Chadhava, type ChadhavaOffering, type Puja, type Temple } from "@/lib/supabase";
import type { Fetcher, Snapshot } from "@/lib/catalog";

/** Only what the listing cards show; the full rows carry large FAQ/about JSON. */
export const PUJA_CARD_COLUMNS =
  "id,name,name_hi,date,countdown_datetime,location,location_hi,benefit,benefit_hi,occasion,occasion_hi,image_url,featured,prices,status";

export const CHADHAVA_CARD_COLUMNS =
  "id,item,item_hi,temple,temple_hi,description,description_hi,occasion,occasion_hi,date,countdown_datetime,price,image_url,featured,status,created_at";

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

/* Detail-page fetchers, shared with the prefetch on listing cards (lib/prefetch.ts)
   so a tapped card's page usually opens from cache. */

export const pujaCacheKey = (id: string) => `puja:${id}`;
export const chadhavaCacheKey = (id: string) => `chadhava:${id}`;

export const pujaFetcher = (id: string): Fetcher<Puja> => (signal) =>
  supabase.from("pujas").select("*").eq("id", id).eq("status", "active").retry(false).abortSignal(signal).maybeSingle<Puja>();

export const chadhavaFetcher = (id: string): Fetcher<ChadhavaWithOfferings> => async (signal) => {
  const [ch, off] = await Promise.all([
    supabase.from("chadhavas").select("*").eq("id", id).eq("status", "active").retry(false).abortSignal(signal).maybeSingle<Chadhava>(),
    supabase
      .from("chadhava_offerings")
      .select("*")
      .eq("chadhava_id", id)
      .eq("status", "active")
      .order("sort_order")
      .retry(false)
      .abortSignal(signal)
      .returns<ChadhavaOffering[]>(),
  ]);
  // Offerings are what the visitor buys, so either query failing counts as a failure.
  const error = ch.error ?? off.error;
  if (error) return { data: null, error };
  return { data: ch.data ? { chadhava: ch.data, offerings: off.data ?? [] } : null, error: null };
};

/* Listing fetchers shared by the home page and the listing pages (same cache keys). */

export const activePujasFetcher: Fetcher<Puja[]> = (signal) =>
  supabase.from("pujas").select(PUJA_CARD_COLUMNS).eq("status", "active").retry(false).abortSignal(signal).returns<Puja[]>();

export const chadhavaListFetcher: Fetcher<ChadhavaList> = async (signal) => {
  const [ch, off] = await Promise.all([
    supabase.from("chadhavas").select(CHADHAVA_CARD_COLUMNS).eq("status", "active").retry(false).abortSignal(signal).returns<Chadhava[]>(),
    supabase
      .from("chadhava_offerings")
      .select("chadhava_id, price")
      .eq("status", "active")
      .retry(false)
      .abortSignal(signal)
      .returns<{ chadhava_id: string; price: number }[]>(),
  ]);
  // Starting prices are a nice-to-have; only the chadhavas decide success.
  if (ch.error) return { data: null, error: ch.error };
  return { data: { chadhavas: ch.data ?? [], minPrices: minOfferingPrices(off.data ?? []) }, error: null };
};
