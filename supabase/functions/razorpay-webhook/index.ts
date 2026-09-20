// supabase/functions/razorpay-webhook/index.ts
// Handles Razorpay webhook events — the server-side confirmation that does not depend
// on the customer's browser surviving the payment (mobile UPI flows often kill the tab).
// Deploy: supabase functions deploy razorpay-webhook --no-verify-jwt
//
// Razorpay Dashboard → Account & Settings → Webhooks:
//   URL:    https://<project-ref>.supabase.co/functions/v1/razorpay-webhook
//   Secret: the value stored as RAZORPAY_WEBHOOK_SECRET
//   Events: payment.captured, payment.failed, order.paid

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { markOrderPaid, unixToIso } from "../_shared/razorpay.ts";

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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PaymentEntity {
  id: string;
  order_id?: string;
  amount?: number;
  status?: string;
  created_at?: number;
  notes?: Record<string, unknown> | unknown[];
}

interface OrderEntity {
  id: string;
  receipt?: string | null;
  notes?: Record<string, unknown> | unknown[];
}

/**
 * Finds our order for a Razorpay payment/order. Primary key is razorpay_order_id; the
 * receipt and notes.db_order_id we set in create-order are fallbacks in case that write failed.
 */
// deno-lint-ignore no-explicit-any
async function findOrder(supabase: any, razorpayOrderId: string | undefined, hints: (string | undefined | null)[]) {
  const select = "id, status, amount, razorpay_order_id";
  if (razorpayOrderId) {
    const { data } = await supabase.from("orders").select(select).eq("razorpay_order_id", razorpayOrderId).maybeSingle();
    if (data) return data;
  }
  for (const hint of hints) {
    if (typeof hint === "string" && UUID_RE.test(hint)) {
      const { data } = await supabase.from("orders").select(select).eq("id", hint).maybeSingle();
      if (data) return data;
    }
  }
  return null;
}

const noteValue = (notes: PaymentEntity["notes"], key: string) =>
  notes && !Array.isArray(notes) ? (notes[key] as string | undefined) : undefined;

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    if (!webhookSecret) {
      // Loud failure: a 500 makes Razorpay retry, so deliveries are not lost once the secret is set.
      console.error("RAZORPAY_WEBHOOK_SECRET is not set — cannot verify webhook; set it with `supabase secrets set`");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const receivedSignature = req.headers.get("x-razorpay-signature");
    if (!receivedSignature) {
      return new Response("Missing signature", { status: 400 });
    }

    // ── Verify webhook signature (use RAW body) ──
    const rawBody = await req.text();
    const expectedSignature = await hmacSHA256(webhookSecret, rawBody);

    if (expectedSignature !== receivedSignature) {
      console.error("WEBHOOK SIGNATURE MISMATCH — wrong secret or spoofing attempt");
      return new Response("Invalid signature", { status: 400 });
    }

    // ── Parse the event ──
    const event = JSON.parse(rawBody);
    const eventType: string = event.event;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const payment: PaymentEntity | undefined = event.payload?.payment?.entity;
      const rzpOrder: OrderEntity | undefined = event.payload?.order?.entity;
      const razorpayOrderId = payment?.order_id || rzpOrder?.id;

      if (!payment?.id) {
        console.error(`Webhook ${eventType}: no payment entity in payload`);
        return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      const order = await findOrder(supabase, razorpayOrderId, [
        rzpOrder?.receipt,
        noteValue(rzpOrder?.notes, "db_order_id"),
        noteValue(payment.notes, "db_order_id"),
      ]);

      if (!order) {
        console.error(`Webhook ${eventType}: no order found for Razorpay order ${razorpayOrderId} / payment ${payment.id}`);
      } else if (typeof payment.amount === "number" && payment.amount !== order.amount) {
        console.error(`Webhook ${eventType}: amount mismatch for order ${order.id} — paid ${payment.amount}, expected ${order.amount}`);
      } else {
        // markOrderPaid is idempotent and also reports the Meta Purchase once; a payment
        // already recorded by verify-payment or reconcile-orders is left untouched.
        const changed = await markOrderPaid(supabase, {
          orderId: order.id,
          paymentId: payment.id,
          paidAt: unixToIso(payment.created_at),
          source: "webhook",
        });
        if (!changed) console.log(`Webhook ${eventType}: order ${order.id} was already paid`);
      }
    }

    if (eventType === "payment.failed") {
      const payment: PaymentEntity | undefined = event.payload?.payment?.entity;
      const order = await findOrder(supabase, payment?.order_id, [noteValue(payment?.notes, "db_order_id")]);

      if (order && order.status === "pending") {
        await supabase
          .from("orders")
          .update({ status: "failed" })
          .eq("id", order.id)
          .eq("status", "pending");

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
