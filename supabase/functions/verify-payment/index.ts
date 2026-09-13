// supabase/functions/verify-payment/index.ts
// Verifies Razorpay payment signature using HMAC SHA256
// Deploy: supabase functions deploy verify-payment --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { runInBackground, sendPurchaseForOrder } from "../_shared/metaCapi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function hmacSHA256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, db_order_id } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !db_order_id) {
      return new Response(
        JSON.stringify({ error: "Missing payment details" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Verify signature using HMAC SHA256 ──
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = await hmacSHA256(keySecret, message);

    if (expectedSignature !== razorpay_signature) {
      // SECURITY: Signature mismatch — possible tampering!
      console.error("PAYMENT SIGNATURE MISMATCH", { razorpay_order_id, db_order_id });
      return new Response(
        JSON.stringify({ error: "Payment verification failed — signature mismatch" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Signature valid — update order in database ──
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check order exists and is still pending (idempotent)
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, razorpay_order_id")
      .eq("id", db_order_id)
      .single();

    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SECURITY: the signature only proves that payment belongs to razorpay_order_id.
    // Without this check, a genuine payment for a cheap order could mark any other
    // order as paid.
    if (order.razorpay_order_id !== razorpay_order_id) {
      console.error("PAYMENT ORDER MISMATCH", { razorpay_order_id, db_order_id });
      return new Response(
        JSON.stringify({ error: "Payment verification failed — payment does not match this order" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (order.status === "paid") {
      // Already processed (idempotent). Still offer the Meta Purchase — the claim inside
      // sends it only if nothing has reported it yet (e.g. an earlier send failed).
      await runInBackground(() => sendPurchaseForOrder(supabase, order.id));
      return new Response(
        JSON.stringify({ success: true, message: "Payment already verified" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update order to paid
    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        status: "paid",
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq("id", db_order_id);

    if (updateErr) {
      return new Response(
        JSON.stringify({ error: "Failed to update order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Meta Conversions API: server-side Purchase (reported exactly once) ──
    await runInBackground(() => sendPurchaseForOrder(supabase, order.id));

    return new Response(
      JSON.stringify({ success: true, message: "Payment verified successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
