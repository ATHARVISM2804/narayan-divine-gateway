// supabase/functions/pay-order/index.ts
// Backs the customer's payment link https://www.narayankripa.in/pay/<order id>, sent by the
// admin for a manual booking (or for a website order whose payment got stuck).
// Returns what the pay page shows and the Razorpay order to pay; never the phone, email or
// address. The order id is an unguessable UUID, like the link in an order confirmation.
// Deploy: supabase functions deploy pay-order --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { reconcileOrder } from "../_shared/razorpay.ts";
import { noteValue } from "../_shared/orderPricing.ts";
import { createRazorpayOrder } from "../_shared/razorpayOrder.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

interface Item {
  name?: string;
  quantity?: number;
  category?: string;
  puja_date?: string | null;
  puja_location?: string | null;
  chadhava_date?: string | null;
  chadhava_temple?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { order_id } = await req.json().catch(() => ({}));
    if (typeof order_id !== "string" || !UUID_RE.test(order_id)) return json({ error: "Invalid link" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, amount, items, customer_name, customer_phone, razorpay_order_id, razorpay_payment_id, paid_at")
      .eq("id", order_id)
      .maybeSingle();
    if (!order) return json({ error: "This payment link is not valid." }, 404);

    const firstName = String(order.customer_name ?? "").split(" ")[0];
    const items = ((order.items ?? []) as Item[]).map((i) => ({
      name: i.name ?? "",
      quantity: i.quantity ?? 1,
      when: [i.puja_date ?? i.chadhava_date, i.puja_location ?? i.chadhava_temple].filter(Boolean).join(" • ") || null,
    }));
    const summary = { status: order.status, amount: order.amount, name: firstName, items };

    if (order.status === "paid" || order.status === "cancelled" || order.status === "refunded") return json(summary);

    // Paid already but not yet recorded (the customer closed the page mid-payment)?
    if (order.razorpay_order_id) {
      const r = await reconcileOrder(supabase, order);
      if (r.status === "paid") return json({ ...summary, status: "paid" });
    }

    let razorpayOrderId: string | null = order.razorpay_order_id;
    if (!razorpayOrderId) {
      const rzp = await createRazorpayOrder({
        amount: order.amount,
        currency: "INR",
        receipt: order.id,
        notes: { db_order_id: order.id, customer_name: noteValue(order.customer_name), customer_phone: noteValue(order.customer_phone) },
      }, "pay-order");
      if (!rzp.ok || !rzp.json?.id) return json({ error: "Payment gateway is busy. Please try again in a moment." }, 502);
      const { error } = await supabase.from("orders").update({ razorpay_order_id: rzp.json.id }).eq("id", order.id);
      if (error) return json({ error: "Could not start payment. Please try again." }, 500);
      razorpayOrderId = rzp.json.id;
    }

    return json({ ...summary, razorpay_order_id: razorpayOrderId, key_id: Deno.env.get("RAZORPAY_KEY_ID") });
  } catch (e) {
    console.error("[pay-order] error", e instanceof Error ? e.message : e);
    return json({ error: "Server error" }, 500);
  }
});
