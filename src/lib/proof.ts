/* Real social proof: admin-entered reviews and booking totals computed from
   paid orders (docs/sql/reviews-and-proof.sql). Both load through useCatalog,
   so they are cached on the device and baked into the build snapshot. When the
   table or view is missing, or empty, the sections that use them hide. */
import { supabase } from "@/lib/supabase";
import { useCatalog, type Snapshot } from "@/lib/catalog";

export interface Review {
  id: string;
  name: string;
  city: string | null;
  city_hi: string | null;
  rating: number;
  text: string | null;
  text_hi: string | null;
  puja_id: string | null;
  chadhava_id: string | null;
  review_date: string;
  video_url: string | null;
  photo_url: string | null;
  featured: boolean;
  sort_order: number;
  status: "active" | "draft";
  created_at: string;
}

export interface SiteStats {
  devotees: number;
  bookings: number;
  temples: number;
  by_item: Record<string, number>;
}

/** Counts below this are not shown: "3 devotees booked" reads as weak, not as proof. */
export const MIN_PROOF_COUNT = 25;

export const reviewsFromSnapshot = (s: Snapshot) => ((s as { reviews?: Review[] }).reviews ?? null);
export const statsFromSnapshot = (s: Snapshot) => ((s as { site_stats?: SiteStats }).site_stats ?? null);

export function useReviews() {
  return useCatalog<Review[]>(
    "reviews:active",
    (signal) =>
      supabase
        .from("reviews")
        .select("*")
        .eq("status", "active")
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("review_date", { ascending: false })
        .limit(60)
        .retry(false)
        .abortSignal(signal)
        .returns<Review[]>(),
    reviewsFromSnapshot,
  );
}

export function useSiteStats() {
  return useCatalog<SiteStats>(
    "site-stats",
    (signal) =>
      supabase.from("public_site_stats").select("*").retry(false).abortSignal(signal).maybeSingle<SiteStats>(),
    statsFromSnapshot,
  );
}

/** Reviews for one puja/chadhava first, then the general ones, without repeats. */
export function reviewsFor(all: Review[] | null, ids: { pujaId?: string; chadhavaId?: string }): Review[] {
  if (!all) return [];
  const own = all.filter((r) => (ids.pujaId && r.puja_id === ids.pujaId) || (ids.chadhavaId && r.chadhava_id === ids.chadhavaId));
  const rest = all.filter((r) => !own.includes(r));
  return [...own, ...rest];
}

export function averageRating(reviews: Review[]): { avg: number; count: number } | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return { avg: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}

/** Extracts the 11-character id from any common YouTube URL form. */
export function youTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : null;
}

/** Rounds down to a friendly "460+" style figure. */
export function roundedCount(n: number): string {
  const step = n >= 10000 ? 1000 : n >= 1000 ? 100 : n >= 100 ? 10 : 1;
  return `${new Intl.NumberFormat("en-IN").format(Math.floor(n / step) * step)}+`;
}
