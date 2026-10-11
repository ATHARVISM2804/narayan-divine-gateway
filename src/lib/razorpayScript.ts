/**
 * Loads Razorpay's checkout.js once, on demand.
 *
 * - A failed attempt removes its <script> tag, so the next try really retries
 *   (a leftover tag used to make every later click fail with
 *   "window.Razorpay is not a constructor" until the page was reloaded).
 * - Each attempt times out, so a stalled network can't spin the Pay button forever.
 * - Resolves only once window.Razorpay actually exists.
 */
export const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const ATTEMPT_TIMEOUT_MS = 15_000;

let inflight: Promise<void> | null = null;

const hasRazorpay = () => typeof (window as unknown as { Razorpay?: unknown }).Razorpay === "function";

function attempt(timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    document.querySelectorAll(`script[src="${RAZORPAY_SRC}"]`).forEach((el) => el.remove());
    const s = document.createElement("script");
    s.src = RAZORPAY_SRC;
    s.async = true;
    const fail = (why: string) => {
      clearTimeout(timer);
      s.remove();
      reject(new Error(why));
    };
    const timer = setTimeout(() => fail("Payment page took too long to load"), timeoutMs);
    s.onload = () => {
      clearTimeout(timer);
      if (hasRazorpay()) resolve();
      else fail("Payment page failed to load");
    };
    s.onerror = () => fail("Payment page failed to load");
    document.head.appendChild(s);
  });
}

export function loadRazorpayScript(opts: { attempts?: number; timeoutMs?: number } = {}): Promise<void> {
  if (hasRazorpay()) return Promise.resolve();
  if (inflight) return inflight;
  const attempts = opts.attempts ?? 2;
  const timeoutMs = opts.timeoutMs ?? ATTEMPT_TIMEOUT_MS;
  inflight = (async () => {
    let lastErr: unknown;
    for (let i = 0; i < attempts; i++) {
      try {
        await attempt(timeoutMs);
        return;
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error("Payment page failed to load");
  })().finally(() => { inflight = null; });
  return inflight;
}
