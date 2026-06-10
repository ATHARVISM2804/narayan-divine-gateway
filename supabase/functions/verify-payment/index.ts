// supabase/functions/verify-payment/index.ts
// Verifies Razorpay payment signature using HMAC SHA256
// Deploy: supabase functions deploy verify-payment --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sendCAPIPurchase(
  req: Request,
  order: { amount: number; customer_email: string | null; customer_phone: string | null },
  dbOrderId: string
): Promise<void> {
  const pixelId = Deno.env.get("META_PIXEL_ID");
  const accessToken = Deno.env.get("META_CAPI_ACCESS_TOKEN");
  if (!pixelId || !accessToken) return; // not configured — skip silently

  const userData: Record<string, string> = {};
  if (order.customer_email) userData.em = await sha256(order.customer_email);
  if (order.customer_phone) userData.ph = await sha256(order.customer_phone.replace(/\D/g, ""));
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("cf-connecting-ip") ?? "";
  const clientUa = req.headers.get("user-agent") ?? "";
  if (clientIp) userData.client_ip_address = clientIp;
  if (clientUa) userData.client_user_agent = clientUa;

  const payload = {
    data: [{
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: `purchase_${dbOrderId}`,
      action_source: "website",
      user_data: userData,
      custom_data: {
        value: order.amount / 100,
        currency: "INR",
        content_type: "product",
        order_id: dbOrderId,
      },
    }],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );
    const result = await res.json();
    console.log("CAPI sent:", res.status, JSON.stringify(result));
  } catch (err) {
    console.error("CAPI error (non-fatal):", err);
  }
}

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
      .select("id, status, amount, customer_email, customer_phone")
      .eq("id", db_order_id)
      .single();

    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (order.status === "paid") {
      // Already processed (idempotent)
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

    // ── Fire CAPI Purchase (fire-and-forget — never blocks the response) ──
    sendCAPIPurchase(req, order, db_order_id);

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
