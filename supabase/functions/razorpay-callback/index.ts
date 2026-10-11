// supabase/functions/razorpay-callback/index.ts
// Redirect-mode checkout (callback_url + redirect: true). Used in in-app browsers
// (Facebook / Instagram / WhatsApp webviews), where the page running checkout.js is often
// reloaded or killed while the customer is in their UPI app, so the JS handler never runs.
// Razorpay POSTs the result here as a form; we verify it, mark the order paid, and
// redirect the customer back to the site.
// Deploy: supabase functions deploy razorpay-callback --no-verify-jwt
//
//   POST ?db=<orders.id>&o=<site origin>
//   success: razorpay_payment_id, razorpay_order_id, razorpay_signature
//   failure: error[code], error[description], error[source], error[step], error[reason], error[metadata]
//
// The redirect target is only ever an allowlisted origin (SITE_ORIGINS), never taken
// from the request as-is, so this endpoint can't be used as an open redirect.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { markOrderPaid, toPaymentError, verifyPaymentSignature } from "../_shared/razorpay.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_ORIGINS = "https://www.narayankripa.in,https://narayankripa.in";

function siteOrigin(requested: string | null): string {
  const allowed = (Deno.env.get("SITE_ORIGINS") || DEFAULT_ORIGINS)
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  return requested && allowed.includes(requested) ? requested : allowed[0];
}

const redirect = (url: string) => new Response(null, { status: 303, headers: { Location: url } });

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const origin = siteOrigin(url.searchParams.get("o"));
  const dbOrderId = url.searchParams.get("db") || "";
  const failed = () => redirect(`${origin}/checkout?step=details&payment=failed`);
  // The success page polls reconcile-orders, which confirms with Razorpay, reports the
  // Purchase and clears the cart — the same path as a browser that lost its callback.
  const checking = () => redirect(`${origin}/order-success?id=${encodeURIComponent(dbOrderId)}&status=checking`);

  if (req.method !== "POST" || !UUID_RE.test(dbOrderId)) {
    console.error("[callback] bad request", req.method, dbOrderId);
    return redirect(`${origin}/checkout`);
  }

  try {
    const form = await req.formData().catch(() => null);
    const field = (k: string) => {
      const v = form?.get(k);
      return typeof v === "string" ? v : "";
    };

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order } = await supabase
      .from("orders")
      .select("id, status, razorpay_order_id")
      .eq("id", dbOrderId)
      .maybeSingle();
    if (!order) {
      console.error("[callback] order not found", dbOrderId);
      return failed();
    }

    const paymentId = field("razorpay_payment_id");
    const rzpOrderId = field("razorpay_order_id");
    const signature = field("razorpay_signature");

    // ── Failure ──
    if (!paymentId || !signature) {
      let metadata: Record<string, unknown> = {};
      try { metadata = JSON.parse(field("error[metadata]") || "{}"); } catch { /* not JSON */ }
      const paymentError = toPaymentError({
        code: field("error[code]"),
        description: field("error[description]"),
        source: field("error[source]"),
        step: field("error[step]"),
        reason: field("error[reason]"),
        metadata,
      });
      console.log("[callback] payment failed for", dbOrderId, paymentError.reason, paymentError.description);
      if (order.status !== "paid") {
        await supabase.from("orders").update({ payment_error: paymentError }).eq("id", order.id);
      }
      // A failure post can arrive for an order that a retry already paid.
      return order.status === "paid" ? checking() : failed();
    }

    // ── Success ──
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const valid = await verifyPaymentSignature(keySecret, rzpOrderId, paymentId, signature);
    if (!valid || order.razorpay_order_id !== rzpOrderId) {
      // Don't trust it, but don't tell a possibly-paying customer it failed either:
      // the success page asks Razorpay directly and only shows "paid" if it really is.
      console.error("[callback] SIGNATURE OR ORDER MISMATCH", { dbOrderId, rzpOrderId, valid });
      return checking();
    }

    if (order.status !== "paid") {
      await markOrderPaid(supabase, {
        orderId: order.id,
        paymentId,
        signature,
        paidAt: new Date().toISOString(),
        source: "callback",
      });
    }
    return checking();
  } catch (e) {
    console.error("[callback] error", dbOrderId, e instanceof Error ? e.message : e);
    // reconcile-orders on the success page still finds the payment if it went through.
    return checking();
  }
});
