// Creates a Razorpay order (POST /v1/orders). Shared by create-order, admin-create-order
// and pay-order so every order is created the same way.

const RAZORPAY_TIMEOUT_MS = 8000;

export interface RazorpayResult {
  ok: boolean;
  status: number;
  json: { id?: string; amount?: number; error?: { description?: string } };
}

/** POST /v1/orders with a timeout and one retry on network errors, 429 and 5xx. */
export async function createRazorpayOrder(body: unknown, tag = "create-order"): Promise<RazorpayResult> {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
  let last: RazorpayResult = { ok: false, status: 0, json: {} };
  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), RAZORPAY_TIMEOUT_MS);
    try {
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      last = { ok: res.ok, status: res.status, json: await res.json().catch(() => ({})) };
      if (res.ok || (res.status !== 429 && res.status < 500)) return last;
    } catch (e) {
      last = { ok: false, status: 0, json: { error: { description: e instanceof Error ? e.message : String(e) } } };
    } finally {
      clearTimeout(timer);
    }
    console.error(`[${tag}] Razorpay attempt ${attempt} failed`, last.status, last.json?.error?.description);
    if (attempt === 1) await new Promise((r) => setTimeout(r, 400));
  }
  return last;
}
