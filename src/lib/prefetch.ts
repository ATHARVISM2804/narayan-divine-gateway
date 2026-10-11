/* Warm the next page when a visitor shows intent (hover, touch, focus on a
   card): download the page's code and its data, so the tap opens instantly. */
import { FRESH_MS, loadCatalog, readCache } from "@/lib/catalog";
import {
  chadhavaCacheKey,
  chadhavaFetcher,
  chadhavaFromSnapshot,
  pujaCacheKey,
  pujaFetcher,
  pujaFromSnapshot,
} from "@/lib/catalogQueries";

const pageChunks = {
  puja: () => import("@/pages/PujaDetail"),
  chadhava: () => import("@/pages/ChadhavaDetail"),
};

const inflight = new Set<string>();

export function prefetchDetail(kind: "puja" | "chadhava", id: string): void {
  pageChunks[kind]().catch(() => {});
  const key = kind === "puja" ? pujaCacheKey(id) : chadhavaCacheKey(id);
  const cached = readCache(key);
  if (inflight.has(key) || (cached && Date.now() - cached.t < FRESH_MS)) return;
  inflight.add(key);
  const run =
    kind === "puja"
      ? loadCatalog(key, pujaFetcher(id), pujaFromSnapshot(id), { retries: 0 })
      : loadCatalog(key, chadhavaFetcher(id), chadhavaFromSnapshot(id), { retries: 0 });
  run.finally(() => inflight.delete(key));
}

/** Spread onto a Link: prefetches on the first sign of intent. */
export const prefetchProps = (kind: "puja" | "chadhava", id: string) => {
  const go = () => prefetchDetail(kind, id);
  return { onPointerEnter: go, onTouchStart: go, onFocus: go };
};
