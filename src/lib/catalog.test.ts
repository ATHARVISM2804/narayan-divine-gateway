import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchWithRetry, loadCatalog, readCache, resetSnapshotForTests, writeCache, type Fetcher } from "./catalog";

const noWait = { sleep: () => Promise.resolve(), timeoutMs: 1000 };
const ok = <T>(data: T) => ({ data, error: null });
const fail = (message = "Failed to fetch") => ({ data: null, error: { message } });

/** A fetcher that plays back the given results in order. */
function scripted<T>(...results: Array<{ data: T | null; error: { message: string } | null } | Error>): Fetcher<T> & { calls: number } {
  const f = Object.assign(
    async () => {
      const r = results[Math.min(f.calls++, results.length - 1)];
      if (r instanceof Error) throw r;
      return r;
    },
    { calls: 0 },
  );
  return f;
}

beforeEach(() => {
  localStorage.clear();
  resetSnapshotForTests();
});
afterEach(() => vi.unstubAllGlobals());

describe("fetchWithRetry", () => {
  it("recovers from a dropped connection on a retry", async () => {
    const f = scripted<string[]>(fail(), new Error("network down"), ok(["puja"]));
    const r = await fetchWithRetry(f, noWait);
    expect(r.data).toEqual(["puja"]);
    expect(f.calls).toBe(3);
  });

  it("gives up after the retries and returns the error", async () => {
    const f = scripted<string[]>(fail("egress quota exceeded"));
    const r = await fetchWithRetry(f, noWait);
    expect(r.error?.message).toBe("egress quota exceeded");
    expect(f.calls).toBe(3);
  });
});

describe("loadCatalog", () => {
  it("shows live data and saves a copy", async () => {
    const r = await loadCatalog("pujas", scripted(ok([{ id: "a" }])), undefined, noWait);
    expect(r).toMatchObject({ data: [{ id: "a" }], source: "live", degraded: false });
    expect(readCache("pujas")?.data).toEqual([{ id: "a" }]);
  });

  it("says empty only when Supabase really returned no rows", async () => {
    const r = await loadCatalog("pujas", scripted(ok([])), undefined, noWait);
    expect(r).toMatchObject({ data: [], source: "live", degraded: false, error: null });
  });

  it("falls back to the saved copy when Supabase is down", async () => {
    writeCache("pujas", [{ id: "saved" }]);
    const r = await loadCatalog("pujas", scripted<{ id: string }[]>(fail()), undefined, noWait);
    expect(r).toMatchObject({ data: [{ id: "saved" }], source: "cache", degraded: true });
  });

  it("falls back to the build snapshot for a first-time visitor", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ pujas: [{ id: "snap" }] }))));
    const r = await loadCatalog("pujas", scripted<{ id: string }[]>(fail()), (s) => s.pujas as { id: string }[], noWait);
    expect(r).toMatchObject({ data: [{ id: "snap" }], source: "snapshot", degraded: true });
  });

  it("reports failure (never 'empty') when nothing can be shown", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("not found", { status: 404 })));
    const r = await loadCatalog("pujas", scripted<{ id: string }[]>(fail()), (s) => s.pujas as { id: string }[], noWait);
    expect(r).toMatchObject({ data: null, source: null, degraded: true, notFound: false });
    expect(r.error).toBe("Failed to fetch");
  });

  it("treats a missing item as not found only when the request succeeded", async () => {
    expect(await loadCatalog("puja:x", scripted(ok(null)), undefined, noWait)).toMatchObject({ notFound: true });
    const down = await loadCatalog("puja:x", scripted<{ id: string }>(fail()), undefined, noWait);
    expect(down.notFound).toBe(false);
  });

  it("survives blocked browser storage", async () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("QuotaExceeded"); });
    const r = await loadCatalog("pujas", scripted(ok([{ id: "a" }])), undefined, noWait);
    expect(r.data).toEqual([{ id: "a" }]);
    spy.mockRestore();
  });
});
