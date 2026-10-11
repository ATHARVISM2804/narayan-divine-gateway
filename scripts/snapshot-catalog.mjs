// Saves the active pujas / chadhavas / temples into public/catalog-snapshot.json at
// build time. The site shows this copy only when Supabase can't be reached and the
// visitor has no saved copy of their own (see src/lib/catalog.ts), so an outage
// never shows "No pujas available".
//
// It must never break a build: on any error it logs a warning and exits 0.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const OUT = new URL("../public/catalog-snapshot.json", import.meta.url);

function envVar(name) {
  if (process.env[name]) return process.env[name];
  for (const file of [".env.local", ".env"]) {
    const path = new URL(`../${file}`, import.meta.url);
    if (!existsSync(path)) continue;
    const m = readFileSync(path, "utf8").match(new RegExp(`^${name}=(.*)$`, "m"));
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  return undefined;
}

async function table(base, key, path) {
  const res = await fetch(`${base}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`${path.split("?")[0]}: HTTP ${res.status}`);
  return res.json();
}

try {
  const base = envVar("VITE_SUPABASE_URL");
  const key = envVar("VITE_SUPABASE_ANON_KEY");
  if (!base || !key) throw new Error("VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set");

  const [pujas, chadhavas, chadhava_offerings, temples] = await Promise.all([
    table(base, key, "pujas?select=*&status=eq.active"),
    table(base, key, "chadhavas?select=*&status=eq.active"),
    table(base, key, "chadhava_offerings?select=*&status=eq.active"),
    table(base, key, "temples?select=*&status=eq.active"),
  ]);
  // Proof data is optional: before docs/sql/reviews-and-proof.sql has run these
  // objects do not exist, and the snapshot is still useful without them.
  const optional = (path) => table(base, key, path).catch(() => null);
  const [reviews, statsRows] = await Promise.all([
    optional("reviews?select=*&status=eq.active&order=featured.desc,sort_order.asc,review_date.desc&limit=60"),
    optional("public_site_stats?select=*"),
  ]);
  const site_stats = Array.isArray(statsRows) ? statsRows[0] ?? null : null;
  const snapshot = { generated_at: new Date().toISOString(), pujas, chadhavas, chadhava_offerings, temples, reviews, site_stats };
  writeFileSync(OUT, JSON.stringify(snapshot));
  console.log(
    `catalog snapshot: ${pujas.length} pujas, ${chadhavas.length} chadhavas, ` +
      `${chadhava_offerings.length} offerings, ${temples.length} temples, ` +
      `${reviews ? reviews.length : "no"} reviews, ${site_stats ? "with" : "no"} stats`,
  );
} catch (e) {
  console.warn(`catalog snapshot skipped (${e instanceof Error ? e.message : e}); the build continues without it`);
}
