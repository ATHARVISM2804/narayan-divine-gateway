// supabase/functions/admin-order-action/index.ts
// Admin-only order changes that the automatic payment flow can't make:
//   mark_paid  — customer paid on a call (UPI / cash / bank transfer / other)
//   undo_paid  — undo a manual payment entered by mistake
//   cancel     — close a duplicate / dropped pending order
//   reopen     — undo a cancel
// Deploy: supabase functions deploy admin-order-action --no-verify-jwt
// Auth: the admin's Supabase session (email must equal the ADMIN_EMAIL secret).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { adminEmailFromRequest } from "../_shared/adminAuth.ts";
import { reconcileOrder } from "../_shared/razorpay.ts";
import { runInBackground, sendPurchaseForOrder } from "../_shared/metaCapi.ts";
import {
  buildCancelPatch,
  buildMarkPaidPatch,
  buildReopenPatch,
  buildUndoPaidPatch,
  type OrderState,
} from "../_shared/manualPayment.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COLUMNS =
  "id, status, amount, created_at, paid_at, payment_method, manual_payment, razorpay_order_id, razorpay_payment_id";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const admin = await adminEmailFromRequest(req, supabase);
    if (!admin) return json({ error: "Only the admin can do this. Please log in again." }, 401);

    const body = await req.json().catch(() => ({}));
    const { action, order_id } = body ?? {};
    if (typeof order_id !== "string" || !UUID_RE.test(order_id)) return json({ error: "Invalid order id" }, 400);

    const load = async () => {
      const { data, error } = await supabase.from("orders").select(COLUMNS).eq("id", order_id).maybeSingle();
      if (error) throw new Error(error.message);
      return data as (OrderState & { razorpay_order_id: string | null; paid_at: string | null }) | null;
    };

    let order = await load();
    if (!order) return json({ error: "Order not found" }, 404);

    let result;
    if (action === "mark_paid") {
      // The customer may actually have completed the online payment (e.g. after the call).
      // Razorpay is the source of truth: record that instead of a manual entry.
      if (order.razorpay_order_id && order.status !== "paid") {
        try {
          const rz = await reconcileOrder(supabase, order);
          if (rz.status === "paid") {
            return json({ order: await load(), via: "razorpay", message: "Razorpay already has this payment — marked paid automatically." });
          }
        } catch (e) {
          // Razorpay unreachable: carry on with the manual entry the admin asked for.
          console.error("[admin-order-action] Razorpay check failed", order.id, e instanceof Error ? e.message : e);
        }
      }
      result = buildMarkPaidPatch(order, body, admin);
    } else if (action === "undo_paid") {
      result = buildUndoPaidPatch(order, admin);
    } else if (action === "cancel") {
      result = buildCancelPatch(order, body.reason, body.duplicate_of, admin);
    } else if (action === "reopen") {
      result = buildReopenPatch(order, admin);
    } else {
      return json({ error: "Unknown action" }, 400);
    }

    if (!result.ok) return json({ error: result.error }, 409);

    // Guard on the status we validated against, so two admins (or the webhook) can't race.
    const { data: updated, error } = await supabase
      .from("orders")
      .update(result.patch)
      .eq("id", order.id)
      .eq("status", order.status)
      .select(COLUMNS)
      .maybeSingle();
    if (error) return json({ error: "Could not update the order" }, 500);
    if (!updated) return json({ error: "The order changed meanwhile — refresh and try again." }, 409);
    order = updated;

    console.log(`[admin-order-action] ${action} ${order_id} by ${admin}`);
    if (action === "mark_paid") {
      // Offline conversion for Meta (action_source phone_call), sent once per order.
      await runInBackground(() => sendPurchaseForOrder(supabase, order_id));
    }
    return json({ order, via: "admin" });
  } catch (e) {
    console.error("[admin-order-action] error", e instanceof Error ? e.message : e);
    return json({ error: "Server error" }, 500);
  }
});
