// supabase/functions/admin-create-order/index.ts
// A booking the admin enters by hand (admin panel → New Booking), for a customer who
// booked on a call or on WhatsApp. Items are priced exactly like a website order, then:
//   payment.mode = "paid"  → saved as paid (UPI / cash / bank transfer / other, with UTR)
//   payment.mode = "link"  → saved as pending with a Razorpay order, so the customer can
//                            pay at /pay/<id> and every existing payment check applies.
// Manual bookings are marked source = 'admin' and never reported to Meta as a Purchase.
// Deploy: supabase functions deploy admin-create-order --no-verify-jwt
// Auth: the admin's Supabase session (email must equal the ADMIN_EMAIL secret).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { adminEmailFromRequest } from "../_shared/adminAuth.ts";
import { noteValue, validateCartLines } from "../_shared/orderPricing.ts";
import { priceOrderLines } from "../_shared/priceOrderLines.ts";
import { buildManualBooking, normalizeMobile, sameBooking, type ManualBookingInput } from "../_shared/manualBooking.ts";
import { createRazorpayOrder } from "../_shared/razorpayOrder.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const DOUBLE_SAVE_MS = 2 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const admin = await adminEmailFromRequest(req, supabase);
    if (!admin) return json({ error: "Only the admin can do this. Please log in again." }, 401);

    const body = (await req.json().catch(() => ({}))) as ManualBookingInput & { items?: unknown };

    const checked = validateCartLines(body.items);
    if (!checked.ok) return json({ error: checked.error }, 400);
    const priced = await priceOrderLines(supabase, checked.lines);
    if (!priced.ok) return json({ error: priced.error, code: priced.code, item_id: priced.item_id }, priced.status);

    const built = buildManualBooking(body, priced, admin);
    if (!built.ok) return json({ error: built.error }, 400);
    const { row, mode } = built;

    // A double tap on Save (or a retry after a slow network) returns the booking just made.
    const phone = normalizeMobile(body.customer?.phone)!;
    const { data: recent } = await supabase
      .from("orders")
      .select("id, status, amount, customer_phone, items")
      .eq("source", "admin")
      .eq("customer_phone", phone)
      .gte("created_at", new Date(Date.now() - DOUBLE_SAVE_MS).toISOString());
    const again = (recent ?? []).find((o: { customer_phone: string; items: { id: string; quantity: number }[] }) =>
      sameBooking(o, phone, priced.items));
    if (again) return json({ db_order_id: again.id, status: again.status, amount: again.amount, repeated: true });

    const { data: order, error: dbError } = await supabase.from("orders").insert(row).select("id, amount").single();
    if (dbError || !order) {
      console.error("[admin-create-order] insert failed", dbError?.message);
      return json({ error: dbError?.message || "Could not save the booking" }, 500);
    }

    if (mode === "link") {
      // The same Razorpay order a website checkout gets, so verify-payment, the webhook,
      // reconciliation and the admin's "Check" button all work for it unchanged.
      const rzp = await createRazorpayOrder({
        amount: order.amount,
        currency: "INR",
        receipt: order.id,
        notes: { db_order_id: order.id, customer_name: noteValue(row.customer_name), customer_phone: noteValue(phone), source: "admin" },
      }, "admin-create-order");
      if (rzp.ok && rzp.json?.id) {
        await supabase.from("orders").update({ razorpay_order_id: rzp.json.id }).eq("id", order.id);
      } else {
        // Not fatal: the pay page creates the Razorpay order when the customer opens the link.
        console.error("[admin-create-order] Razorpay order failed", order.id, rzp.status, rzp.json?.error?.description);
      }
    }

    return json({ db_order_id: order.id, status: row.status, amount: order.amount });
  } catch (e) {
    console.error("[admin-create-order] error", e instanceof Error ? e.message : e);
    return json({ error: "Server error" }, 500);
  }
});
