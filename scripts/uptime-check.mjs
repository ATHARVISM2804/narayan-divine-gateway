// Checks what a visitor of narayankripa.in actually depends on. Exits 1 on any
// failure, so the scheduled GitHub Action (.github/workflows/uptime.yml) fails and
// GitHub emails the team. Run locally with: node scripts/uptime-check.mjs
//
// It reads the Supabase URL + public (anon) key out of the live JS bundle, so the
// check uses exactly what visitors use and needs no secrets.

const SITE = process.env.SITE_URL || "https://narayankripa.in";
const failures = [];

async function check(name, fn) {
  try {
    const detail = await fn();
    console.log(`ok    ${name}${detail ? ` — ${detail}` : ""}`);
    return true;
  } catch (e) {
    failures.push(name);
    console.log(`FAIL  ${name} — ${e instanceof Error ? e.message : e}`);
    return false;
  }
}

async function get(url, init = {}) {
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  throw last;
}

let supabaseUrl, anonKey, pujas;

await check("site loads", async () => {
  const res = await get(`${SITE}/puja`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const src = html.match(/src="(\/assets\/index-[^"]+\.js)"/)?.[1];
  if (!src) throw new Error("app bundle not found in HTML");
  const js = await (await get(SITE + src)).text();
  supabaseUrl = js.match(/https:\/\/[a-z0-9]+\.supabase\.co/)?.[0];
  anonKey = js.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sb_publishable_[A-Za-z0-9_-]+/)?.[0];
  if (!supabaseUrl || !anonKey) throw new Error("Supabase config not found in bundle");
  return src;
});

if (supabaseUrl && anonKey) {
  await check("pujas load from Supabase", async () => {
    const res = await get(`${supabaseUrl}/rest/v1/pujas?select=id,name,image_url&status=eq.active`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
    pujas = JSON.parse(body);
    if (!Array.isArray(pujas) || pujas.length === 0) throw new Error("0 active pujas returned");
    return `${pujas.length} active`;
  });
}

const image = pujas?.find((p) => p.image_url)?.image_url;
if (image) {
  await check("puja images load (Vercel-resized)", async () => {
    const res = await get(`${SITE}/_vercel/image?url=${encodeURIComponent(image)}&w=640&q=75`, {
      headers: { Accept: "image/webp,*/*" },
    });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.startsWith("image/")) throw new Error(`HTTP ${res.status} ${type}`);
    return `${Math.round((await res.arrayBuffer()).byteLength / 1024)} KB ${type}`;
  });
}

if (failures.length) {
  console.log(`\n${failures.length} check(s) failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("\nall checks passed");
