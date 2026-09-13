/**
 * Meta Pixel (Dataset) event helpers.
 *
 * The dataset ID itself lives in ONE place only: the `fbq('init', ...)` call in
 * index.html. Nothing here needs it — `fbq('track', ...)` broadcasts to every
 * dataset that was initialised, so adding a second `fbq('init', '<id>')` line in
 * index.html is all it takes to send these same events to both datasets.
 *
 * InitiateCheckout, Purchase and Lead are also sent server-side (Conversions API,
 * supabase/functions/_shared/metaCapi.ts). Those browser calls pass an `eventId`
 * that the server reuses, so Meta counts each browser/server pair once.
 *
 * Every call is a no-op when fbq is missing (ad blocker, SSR, tests), so
 * tracking can never break a user flow.
 */

type FbqOptions = { eventID: string };

type FbqArgs =
  | ["track", string, Record<string, unknown>?, FbqOptions?]
  | ["trackCustom", string, Record<string, unknown>?, FbqOptions?];

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Currency for every monetary event — the store prices exclusively in rupees. */
const CURRENCY = "INR";

/** Safely call fbq; swallows everything so analytics can never break checkout. */
const fire = (...args: FbqArgs) => {
  try {
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;
    window.fbq(...args);
    if (import.meta.env.DEV) console.debug("[MetaPixel]", ...args);
  } catch {
    // Never let a tracking failure surface to the user.
  }
};

/** fbq's 4th argument; omitted entirely when there is no id. */
const dedupe = (eventId?: string): FbqOptions | undefined => (eventId ? { eventID: eventId } : undefined);

/** A cart/order line as Meta expects it. */
export interface PixelLineItem {
  id: string;
  quantity: number;
  price: number;
}

const toContents = (items: PixelLineItem[]) =>
  items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: i.price }));

/* ── Browser identifiers for the Conversions API ─────────────────── */

const FBCLID_STORAGE_KEY = "nk_fbclid";
const FBC_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

const readCookie = (name: string) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
};

/**
 * Remembers the ad click id from the landing URL. The Pixel normally stores it in
 * the _fbc cookie, but that cookie is missing when fbevents.js is blocked, and SPA
 * navigation drops ?fbclid from the address bar before checkout.
 */
export const captureFbclid = () => {
  try {
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (fbclid) localStorage.setItem(FBCLID_STORAGE_KEY, JSON.stringify({ id: fbclid, ts: Date.now() }));
  } catch {
    // Storage unavailable (private mode) — the _fbc cookie still covers most visitors.
  }
};

export interface MetaTrackingContext {
  fbp?: string;
  fbc?: string;
  event_source_url?: string;
}

/** _fbp, _fbc (or one rebuilt from a saved fbclid) and the current URL, for server-side events. */
export const getMetaTrackingContext = (): MetaTrackingContext => {
  try {
    let fbc = readCookie("_fbc");
    if (!fbc) {
      const saved = JSON.parse(localStorage.getItem(FBCLID_STORAGE_KEY) || "null");
      if (saved?.id && Date.now() - saved.ts < FBC_MAX_AGE_MS) fbc = `fb.1.${saved.ts}.${saved.id}`;
    }
    return { fbp: readCookie("_fbp"), fbc, event_source_url: window.location.href };
  } catch {
    return {};
  }
};

/** A unique id shared by a browser event and its server-side twin. */
export const newMetaEventId = (prefix: string) => {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}.${random}`;
};

/* ── Standard events ─────────────────────────────────────────────── */

/** Fired on first load by index.html, then on every SPA route change. */
export const trackPageView = () => fire("track", "PageView");

/** A puja / chadhava detail page was opened. Powers retargeting audiences. */
export const trackViewContent = (p: {
  id: string;
  name: string;
  value?: number;
  category?: string;
}) =>
  fire("track", "ViewContent", {
    content_ids: [p.id],
    content_name: p.name,
    content_type: "product",
    content_category: p.category,
    value: p.value,
    currency: CURRENCY,
  });

/** An item was added to the cart. */
export const trackAddToCart = (p: {
  id: string;
  name: string;
  value: number;
  quantity: number;
  category?: string;
}) =>
  fire("track", "AddToCart", {
    content_ids: [p.id],
    content_name: p.name,
    content_type: "product",
    content_category: p.category,
    contents: toContents([{ id: p.id, quantity: p.quantity, price: p.value }]),
    value: p.value * p.quantity,
    currency: CURRENCY,
  });

/** The order was created and the Razorpay checkout sheet is about to open. */
export const trackInitiateCheckout = (p: {
  items: PixelLineItem[];
  value: number;
  eventId?: string;
}) =>
  fire(
    "track",
    "InitiateCheckout",
    {
      content_ids: p.items.map((i) => i.id),
      content_type: "product",
      contents: toContents(p.items),
      num_items: p.items.reduce((n, i) => n + i.quantity, 0),
      value: p.value,
      currency: CURRENCY,
    },
    dedupe(p.eventId),
  );

/**
 * A payment that the SERVER has verified. Never call this on button click —
 * only after verify-payment confirms the Razorpay signature, or Meta will
 * count abandoned and failed payments as revenue.
 */
export const trackPurchase = (p: {
  items: PixelLineItem[];
  value: number;
  orderId: string;
  eventId?: string;
}) =>
  fire(
    "track",
    "Purchase",
    {
      content_ids: p.items.map((i) => i.id),
      content_type: "product",
      contents: toContents(p.items),
      num_items: p.items.reduce((n, i) => n + i.quantity, 0),
      value: p.value,
      currency: CURRENCY,
      order_id: p.orderId,
    },
    dedupe(p.eventId),
  );

/** Name + phone captured before checkout. */
export const trackLead = (p: { name: string; value?: number; eventId?: string }) =>
  fire(
    "track",
    "Lead",
    {
      content_name: p.name,
      value: p.value,
      currency: CURRENCY,
    },
    dedupe(p.eventId),
  );

/** A visitor tapped a WhatsApp link to chat with the team. */
export const trackContact = (channel: string) => fire("track", "Contact", { content_name: channel });
