import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Loads public catalog data (pujas, chadhavas, temples) so that a failed
 * request is never shown as "nothing available".
 *
 * On 28 Sep 2026 Supabase blocked the project (bandwidth quota) and every page
 * silently rendered its empty state, so visitors saw "No pujas available" and
 * left. Now each load:
 *   1. retries with a timeout (a slow or dropped mobile connection recovers);
 *   2. falls back to the last good copy saved on this device;
 *   3. falls back to the snapshot baked into the build (public/catalog-snapshot.json,
 *      written by scripts/snapshot-catalog.mjs), so first-time visitors still see pujas;
 *   4. otherwise reports an error, which pages show with Retry + WhatsApp — never
 *      as "empty".
 */

export type CatalogSource = "live" | "cache" | "snapshot";

export interface Snapshot {
  generated_at?: string;
  pujas?: unknown[];
  chadhavas?: unknown[];
  chadhava_offerings?: unknown[];
  temples?: unknown[];
}

interface QueryError { message: string; code?: string }
export interface QueryResult<T> { data: T | null; error: QueryError | null }
/** Runs the query. Resolve `{ data: null, error: null }` for "does not exist". */
export type Fetcher<T> = (signal: AbortSignal) => PromiseLike<QueryResult<T>>;

export interface LoadResult<T> {
  data: T | null;
  source: CatalogSource | null;
  /** The live request failed (data, if any, is a saved copy). */
  degraded: boolean;
  /** The live request succeeded and the item does not exist / is not active. */
  notFound: boolean;
  error: string | null;
}

export interface RetryOptions {
  retries?: number;
  delaysMs?: number[];
  timeoutMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function fetchWithRetry<T>(fetcher: Fetcher<T>, opts: RetryOptions = {}): Promise<QueryResult<T>> {
  const { retries = 2, delaysMs = [1000, 3000], timeoutMs = 8000, sleep = defaultSleep } = opts;
  let last: QueryResult<T> = { data: null, error: { message: "not started" } };
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      last = await fetcher(ctrl.signal);
    } catch (e) {
      last = { data: null, error: { message: e instanceof Error ? e.message : String(e) } };
    } finally {
      clearTimeout(timer);
    }
    if (!last.error) return last;
    if (attempt < retries) await sleep(delaysMs[Math.min(attempt, delaysMs.length - 1)]);
  }
  return last;
}

/* ── last-good copy on this device ── */

const CACHE_PREFIX = "nk-catalog:v1:";

interface CacheEntry<T> { t: number; data: T }

export function readCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const v = JSON.parse(raw) as CacheEntry<T>;
    return v && typeof v.t === "number" && v.data != null ? v : null;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T, now = Date.now()): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: now, data }));
  } catch {
    /* storage full or blocked — the cache is only a convenience */
  }
}

/* ── snapshot baked into the build ── */

let snapshotPromise: Promise<Snapshot | null> | null = null;

export function loadSnapshot(): Promise<Snapshot | null> {
  if (!snapshotPromise) {
    snapshotPromise = fetch("/catalog-snapshot.json", { cache: "no-cache" })
      .then((r) => (r.ok ? (r.json() as Promise<Snapshot>) : null))
      .catch(() => null)
      .then((s) => {
        if (!s) snapshotPromise = null; // try again next time
        return s;
      });
  }
  return snapshotPromise;
}

export function resetSnapshotForTests(): void {
  snapshotPromise = null;
}

export async function loadCatalog<T>(
  key: string,
  fetcher: Fetcher<T>,
  fromSnapshot?: (s: Snapshot) => T | null | undefined,
  opts?: RetryOptions,
): Promise<LoadResult<T>> {
  const res = await fetchWithRetry(fetcher, opts);
  if (!res.error) {
    if (res.data == null) return { data: null, source: "live", degraded: false, notFound: true, error: null };
    writeCache(key, res.data);
    return { data: res.data, source: "live", degraded: false, notFound: false, error: null };
  }
  const error = res.error.message;
  const cached = readCache<T>(key);
  if (cached) return { data: cached.data, source: "cache", degraded: true, notFound: false, error };
  if (fromSnapshot) {
    const snap = await loadSnapshot();
    const v = snap ? fromSnapshot(snap) : null;
    if (v != null) return { data: v, source: "snapshot", degraded: true, notFound: false, error };
  }
  return { data: null, source: null, degraded: true, notFound: false, error };
}

/** A saved copy younger than this is shown without asking Supabase again. */
export const FRESH_MS = 60_000;

export interface CatalogState<T> {
  data: T | null;
  /** Nothing to show yet. */
  loading: boolean;
  /** Showing a saved copy because the live request failed. */
  degraded: boolean;
  notFound: boolean;
  /** Failed and nothing saved to show. */
  failed: boolean;
  retry: () => void;
}

/**
 * React hook around loadCatalog. Shows the saved copy instantly, refreshes it
 * in the background, and retries by itself when the device comes back online.
 * Pass `key = null` to wait (e.g. no id yet).
 */
export function useCatalog<T>(
  key: string | null,
  fetcher: Fetcher<T>,
  fromSnapshot?: (s: Snapshot) => T | null | undefined,
): CatalogState<T> {
  const initial = key ? readCache<T>(key) : null;
  const [state, setState] = useState(() => ({
    data: initial?.data ?? null,
    loading: !initial,
    degraded: false,
    notFound: false,
    failed: false,
  }));
  const fetcherRef = useRef(fetcher);
  const snapRef = useRef(fromSnapshot);
  fetcherRef.current = fetcher;
  snapRef.current = fromSnapshot;
  const run = useRef(0);

  const load = useCallback((force: boolean) => {
    if (!key) return;
    const cached = readCache<T>(key);
    if (!force && cached && Date.now() - cached.t < FRESH_MS) {
      setState({ data: cached.data, loading: false, degraded: false, notFound: false, failed: false });
      return;
    }
    const id = ++run.current;
    if (cached) setState((s) => ({ ...s, data: cached.data, loading: false }));
    else setState((s) => (s.data == null ? { ...s, loading: true, failed: false } : s));
    loadCatalog(key, fetcherRef.current, snapRef.current).then((r) => {
      if (id !== run.current) return; // a newer load started
      setState({
        data: r.data,
        loading: false,
        degraded: r.degraded && r.data != null,
        notFound: r.notFound,
        failed: r.data == null && !r.notFound,
      });
    });
  }, [key]);

  useEffect(() => {
    const cached = key ? readCache<T>(key) : null;
    setState({ data: cached?.data ?? null, loading: !cached, degraded: false, notFound: false, failed: false });
    load(false);
  }, [key, load]);

  const shouldRecover = state.failed || state.degraded;
  useEffect(() => {
    if (!shouldRecover) return;
    const onOnline = () => load(true);
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [shouldRecover, load]);

  const retry = useCallback(() => load(true), [load]);
  return { ...state, retry };
}
