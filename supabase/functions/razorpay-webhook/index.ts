// supabase/functions/razorpay-webhook/index.ts
// Handles Razorpay webhook events (backup verification)
// Deploy: supabase functions deploy razorpay-webhook --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;
    const receivedSignature = req.headers.get("x-razorpay-signature");

    if (!receivedSignature) {
      return new Response("Missing signature", { status: 400 });
    }

    // ── Verify webhook signature (use RAW body) ──
    const rawBody = await req.text();
    const expectedSignature = await hmacSHA256(webhookSecret, rawBody);

    if (expectedSignature !== receivedSignature) {
      console.error("WEBHOOK SIGNATURE MISMATCH — possible spoofing attempt");
      return new Response("Invalid signature", { status: 400 });
    }

    // ── Parse the event ──
    const event = JSON.parse(rawBody);
    const eventType = event.event;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (eventType === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      // Find order by razorpay_order_id
      const { data: order } = await supabase
        .from("orders")
        .select("id, status")
        .eq("razorpay_order_id", razorpayOrderId)
        .single();

      if (order && order.status !== "paid") {
        await supabase
          .from("orders")
          .update({
            status: "paid",
            razorpay_payment_id: razorpayPaymentId,
          })
          .eq("id", order.id);

        console.log(`Webhook: Order ${order.id} marked as paid`);
      }
    }

    if (eventType === "payment.failed") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      const { data: order } = await supabase
        .from("orders")
        .select("id, status")
        .eq("razorpay_order_id", razorpayOrderId)
        .single();

      if (order && order.status === "pending") {
        await supabase
          .from("orders")
          .update({ status: "failed" })
          .eq("id", order.id);

        console.log(`Webhook: Order ${order.id} marked as failed`);
      }
    }

    // Respond 200 immediately (Razorpay retries on non-2xx)
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Server error", { status: 500 });
  }
});
