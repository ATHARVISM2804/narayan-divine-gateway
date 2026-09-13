// supabase/functions/_shared/metaCapi.ts
// Meta Conversions API (server-side events), shared by the edge functions.
//
// Secrets (supabase secrets set ...):
//   META_PIXEL_ID           dataset id — 3979726935662067
//   META_CAPI_ACCESS_TOKEN  Events Manager → dataset → Settings → Conversions API → Generate access token
//   META_TEST_EVENT_CODE    optional, from Events Manager → Test events; unset it after testing
//
// Every send is best-effort and never throws, so tracking can never fail a payment.
// The browser Pixel sends the same event_id, so Meta counts each browser/server pair once.

const GRAPH_API_VERSION = "v26.0";
const DEFAULT_SOURCE_URL = "https://narayankripa.in/checkout";
const SEND_TIMEOUT_MS = 4000;

// Deno / EdgeRuntime globals are read loosely so this file also loads under vitest.
// deno-lint-ignore no-explicit-any
const runtime = globalThis as any;
const env = (key: string): string | undefined => runtime.Deno?.env?.get(key) || undefined;

/* ── Normalisation (Meta customer information parameter rules) ── */

/** Trimmed, lowercase; anything that isn't an email is dropped. */
export const normalizeEmail = (v?: string | null) => {
  const s = (v ?? "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : undefined;
};

/** Digits only, no leading zeros, with country code — 10-digit Indian mobiles get 91. */
export const normalizePhone = (v?: string | null) => {
  let digits = (v ?? "").replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10) digits = `91${digits}`;
  return digits.length >= 11 && digits.length <= 15 ? digits : undefined;
};

/** Lowercase with no spaces or punctuation. Non-Latin scripts are kept (sent as UTF-8). */
export const normalizeText = (v?: string | null) => {
  const s = (v ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{M}\p{N}]/gu, "");
  return s || undefined;
};

/** First word → fn, last word → ln. */
export const splitName = (full?: string | null) => {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  return {
    fn: normalizeText(parts[0]),
    ln: parts.length > 1 ? normalizeText(parts[parts.length - 1]) : undefined,
  };
};

/** Indian 6-digit PIN code. */
export const normalizePincode = (v?: string | null) => {
  const digits = (v ?? "").replace(/\D/g, "");
  return /^[1-9]\d{5}$/.test(digits) ? digits : undefined;
};

/** _fbp / _fbc must look like fb.<subdomainIndex>.<ms timestamp>.<value>; anything else is dropped. */
export const validFbCookie = (v?: unknown) =>
  typeof v === "string" && v.length <= 512 && /^fb\.\d\.\d{10,}\.\S+$/.test(v) ? v : undefined;

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ── user_data ── */

export interface MetaCustomer {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}

export interface MetaClientContext {
  fbp?: string;
  fbc?: string;
  ip?: string;
  userAgent?: string;
  sourceUrl?: string;
}

/** Hashes the PII fields; fbp, fbc, IP and user agent are sent unhashed as Meta requires. */
export async function buildUserData(customer: MetaCustomer, client: MetaClientContext) {
  const { fn, ln } = splitName(customer.name);
  const ph = normalizePhone(customer.phone);
  const toHash: Record<string, string | undefined> = {
    em: normalizeEmail(customer.email),
    ph,
    fn,
    ln,
    ct: normalizeText(customer.city),
    st: normalizeText(customer.state),
    zp: normalizePincode(customer.pincode),
    country: "in",
    // Phone is the one identifier every order and lead has, so it doubles as a stable customer id.
    external_id: ph,
  };

  const userData: Record<string, string> = {};
  for (const [key, value] of Object.entries(toHash)) {
    if (value) userData[key] = await sha256Hex(value);
  }
  if (client.fbp) userData.fbp = client.fbp;
  if (client.fbc) userData.fbc = client.fbc;
  if (client.ip) userData.client_ip_address = client.ip;
  if (client.userAgent) userData.client_user_agent = client.userAgent;
  return userData;
}

/** The visitor's IP and user agent from the request, plus the cookies/URL the browser sent. */
export function clientContextFromRequest(
  req: Request,
  tracking?: { fbp?: unknown; fbc?: unknown; event_source_url?: unknown } | null,
): MetaClientContext {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const sourceUrl = tracking?.event_source_url;
  return {
    fbp: validFbCookie(tracking?.fbp),
    fbc: validFbCookie(tracking?.fbc),
    ip: req.headers.get("cf-connecting-ip") || forwardedFor || req.headers.get("x-real-ip") || undefined,
    userAgent: req.headers.get("user-agent")?.slice(0, 512) || undefined,
    sourceUrl: typeof sourceUrl === "string" && /^https?:\/\//.test(sourceUrl) ? sourceUrl.slice(0, 1000) : undefined,
  };
}

/* ── Stored on orders.meta_tracking so later functions (verify-payment, webhook) can match the visitor ── */

export interface StoredMetaTracking {
  fbp?: string;
  fbc?: string;
  ip?: string;
  user_agent?: string;
  source_url?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

const shortString = (v: unknown, max = 100) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

export const toStoredTracking = (
  client: MetaClientContext,
  customer: { city?: unknown; state?: unknown; pincode?: unknown },
): StoredMetaTracking => ({
  fbp: client.fbp,
  fbc: client.fbc,
  ip: client.ip,
  user_agent: client.userAgent,
  source_url: client.sourceUrl,
  city: shortString(customer.city),
  state: shortString(customer.state),
  pincode: shortString(customer.pincode, 10),
});

const fromStoredTracking = (t: StoredMetaTracking): MetaClientContext => ({
  fbp: validFbCookie(t.fbp),
  fbc: validFbCookie(t.fbc),
  ip: t.ip,
  userAgent: t.user_agent,
  sourceUrl: t.source_url,
});

/* ── custom_data ── */

interface OrderItem {
  id: string;
  price: number;
  quantity?: number;
}

/** currency / value / contents for an order; amount is in paise as stored in orders.amount. */
export function orderCustomData(items: OrderItem[] | null | undefined, amountPaise: number, currency?: string | null) {
  const contents = (items ?? []).map((i) => ({
    id: String(i.id),
    quantity: i.quantity || 1,
    item_price: Number(i.price),
  }));
  return {
    currency: (currency || "INR").toUpperCase(),
    value: amountPaise / 100,
    content_type: "product",
    content_ids: contents.map((c) => c.id),
    contents,
    num_items: contents.reduce((n, c) => n + c.quantity, 0),
  };
}

/* ── Sending ── */

export interface MetaServerEvent {
  event_name: string;
  event_id: string;
  event_time?: number;
  event_source_url?: string;
  user_data: Record<string, string>;
  custom_data?: Record<string, unknown>;
}

/** POSTs website events to the dataset. Resolves true on a 2xx; never throws. */
export async function sendMetaEvents(events: MetaServerEvent[]): Promise<boolean> {
  const labels = events.map((e) => `${e.event_name}:${e.event_id}`);
  const pixelId = env("META_PIXEL_ID");
  const token = env("META_CAPI_ACCESS_TOKEN");
  if (!pixelId || !token) {
    console.warn("[meta-capi] META_PIXEL_ID / META_CAPI_ACCESS_TOKEN not set — skipping", labels);
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const body: Record<string, unknown> = {
    data: events.map(({ event_time, event_source_url, ...rest }) => ({
      ...rest,
      event_time: event_time ?? now,
      event_source_url: event_source_url || DEFAULT_SOURCE_URL,
      action_source: "website",
    })),
  };
  const testEventCode = env("META_TEST_EVENT_CODE");
  if (testEventCode) body.test_event_code = testEventCode;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    );
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[meta-capi] rejected", res.status, labels, JSON.stringify(result));
      return false;
    }
    console.log("[meta-capi] sent", labels, JSON.stringify(result));
    return true;
  } catch (e) {
    console.error("[meta-capi] send failed", labels, e instanceof Error ? e.message : e);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Runs a tracking task without slowing the response when the edge runtime supports
 * background work (EdgeRuntime.waitUntil); otherwise awaits it. Errors are logged, never thrown.
 */
export function runInBackground(task: () => Promise<unknown>): Promise<void> {
  const safe = task().then(
    () => undefined,
    (e) => console.error("[meta-capi] background task failed", e instanceof Error ? e.message : e),
  );
  if (typeof runtime.EdgeRuntime?.waitUntil === "function") {
    runtime.EdgeRuntime.waitUntil(safe);
    return Promise.resolve();
  }
  return safe;
}

/**
 * Reports the server-side Purchase for a paid order exactly once.
 *
 * `UPDATE … WHERE status = 'paid' AND meta_purchase_sent_at IS NULL` is a single atomic
 * statement, so verify-payment and razorpay-webhook racing on the same order can't both
 * win the claim. If Meta rejects the event the claim is released so a later call can retry.
 */
// deno-lint-ignore no-explicit-any
export async function sendPurchaseForOrder(supabase: any, orderId: string): Promise<void> {
  const { data: order, error } = await supabase
    .from("orders")
    .update({ meta_purchase_sent_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", "paid")
    .is("meta_purchase_sent_at", null)
    .select("id, amount, currency, items, customer_name, customer_phone, customer_email, meta_tracking")
    .maybeSingle();

  if (error) {
    console.error("[meta-capi] purchase claim failed — has docs/sql/meta-capi.sql been run?", error.message);
    return;
  }
  if (!order) return; // already reported, or not paid

  const tracking: StoredMetaTracking = order.meta_tracking ?? {};
  const sent = await sendMetaEvents([
    {
      event_name: "Purchase",
      event_id: `purchase.${order.id}`,
      event_source_url: tracking.source_url,
      user_data: await buildUserData(
        {
          name: order.customer_name,
          phone: order.customer_phone,
          email: order.customer_email,
          city: tracking.city,
          state: tracking.state,
          pincode: tracking.pincode,
        },
        fromStoredTracking(tracking),
      ),
      custom_data: { ...orderCustomData(order.items, order.amount, order.currency), order_id: order.id },
    },
  ]);

  if (!sent) {
    await supabase.from("orders").update({ meta_purchase_sent_at: null }).eq("id", order.id);
  }
}
