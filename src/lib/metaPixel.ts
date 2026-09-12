/**
 * Meta Pixel (Dataset) event helpers.
 *
 * The dataset ID itself lives in ONE place only: the `fbq('init', ...)` call in
 * index.html. Nothing here needs it — `fbq('track', ...)` broadcasts to every
 * dataset that was initialised, so adding a second `fbq('init', '<id>')` line in
 * index.html is all it takes to send these same events to both datasets.
 *
 * Every call is a no-op when fbq is missing (ad blocker, SSR, tests), so
 * tracking can never break a user flow.
 */

type FbqArgs =
  | ["track", string, Record<string, unknown>?]
  | ["trackCustom", string, Record<string, unknown>?];

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

/** A cart/order line as Meta expects it. */
export interface PixelLineItem {
  id: string;
  quantity: number;
  price: number;
}

const toContents = (items: PixelLineItem[]) =>
  items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: i.price }));

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

/** The Razorpay checkout sheet is about to open. */
export const trackInitiateCheckout = (p: {
  items: PixelLineItem[];
  value: number;
}) =>
  fire("track", "InitiateCheckout", {
    content_ids: p.items.map((i) => i.id),
    content_type: "product",
    contents: toContents(p.items),
    num_items: p.items.reduce((n, i) => n + i.quantity, 0),
    value: p.value,
    currency: CURRENCY,
  });

/**
 * A payment that the SERVER has verified. Never call this on button click —
 * only after verify-payment confirms the Razorpay signature, or Meta will
 * count abandoned and failed payments as revenue.
 */
export const trackPurchase = (p: {
  items: PixelLineItem[];
  value: number;
  orderId: string;
}) =>
  fire("track", "Purchase", {
    content_ids: p.items.map((i) => i.id),
    content_type: "product",
    contents: toContents(p.items),
    num_items: p.items.reduce((n, i) => n + i.quantity, 0),
    value: p.value,
    currency: CURRENCY,
    order_id: p.orderId,
  });

/** Name + phone captured before checkout. */
export const trackLead = (p: { name: string; value?: number }) =>
  fire("track", "Lead", {
    content_name: p.name,
    value: p.value,
    currency: CURRENCY,
  });
