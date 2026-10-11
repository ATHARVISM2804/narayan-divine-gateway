/* After a deploy, a tab that is still running the previous build asks for page
   chunks that no longer exist. Instead of showing an error, reload once so the
   tab picks up the new build. */
import { lazy, type ComponentType } from "react";

const KEY = "nk-chunk-reload";
const WINDOW_MS = 10_000;

const CHUNK_ERROR =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|ChunkLoadError|Loading chunk .* failed|is not a valid JavaScript MIME type/i;

export function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const e = err as { name?: string; message?: string };
  return CHUNK_ERROR.test(`${e.name ?? ""} ${e.message ?? String(err)}`);
}

/** Full reload, unless we already did one in the last few seconds (avoids a loop
    when the server really is down). Returns true when a reload was started. */
export function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < WINDOW_MS) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Storage blocked: still reload once; the next failure shows the error screen.
  }
  window.location.reload();
  return true;
}

/** React.lazy that recovers from stale chunks by reloading the page. */
export function lazyPage<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return lazy(() =>
    factory().catch((err) => {
      // Keep the loading spinner up while the page reloads.
      if (isChunkLoadError(err) && reloadOnce()) return new Promise<{ default: T }>(() => {});
      throw err;
    }),
  );
}
