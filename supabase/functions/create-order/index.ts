// supabase/functions/create-order/index.ts
// Creates a Razorpay order with server-side price validation
// Deploy: supabase functions deploy create-order --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildUserData,
  clientContextFromRequest,
  orderCustomData,
  runInBackground,
  sendMetaEvents,
  toStoredTracking,
} from "../_shared/metaCapi.ts";
import { isPlausiblePhone, noteValue, validateCartLines } from "../_shared/orderPricing.ts";
import { cleanPujaDetails, priceOrderLines } from "../_shared/priceOrderLines.ts";
import { createRazorpayOrder } from "../_shared/razorpayOrder.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function err(msg: string, status = 400, extra: Record<string, unknown> = {}) {
  // Every rejection is logged: these happen before any order row exists, so the
  // function log is the only trace of a customer who could not reach the payment step.
  console.error("[create-order] rejected:", status, msg, Object.keys(extra).length ? extra : "");
  return new Response(
    JSON.stringify({ error: msg, ...extra }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/** An item in the (possibly days-old) cart that can no longer be booked. The client drops it. */
const unavailable = (msg: string, itemId: string) => err(msg, 409, { code: "ITEM_UNAVAILABLE", item_id: itemId });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { items, customer, puja_details, tracking } = await req.json();

    const customerName = typeof customer?.name === "string" ? customer.name.replace(/\s+/g, " ").trim() : "";
    if (!customerName || !customer?.phone) return err("Name and phone are required");
    if (customerName.length > 100) return err("Name is too long");
    if (!isPlausiblePhone(customer.phone)) return err("Please enter a valid phone number");

    const checked = validateCartLines(items);
    if (!checked.ok) return err(checked.error);
    const lines = checked.lines;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Names and prices come from the DB (shared with admin-create-order).
    const priced = await priceOrderLines(supabase, lines);
    if (!priced.ok) {
      return priced.code ? unavailable(priced.error, priced.item_id!) : err(priced.error, priced.status);
    }
    const { items: validatedItems, totalPaise } = priced;

    // Razorpay's minimum order is ₹1.
    if (!Number.isInteger(totalPaise) || totalPaise < 100) return err("Invalid order amount");

    // ── Create order in database ──
    const { data: order, error: dbError } = await supabase
      .from("orders")
      .insert({
        customer_name: customerName,
        customer_email: customer.email || null,
        customer_phone: customer.phone,
        customer_address: customer.address || null,
        amount: totalPaise,
        items: validatedItems,
        status: "pending",
        puja_details: cleanPujaDetails(puja_details),
      })
      .select("id")
      .single();

    if (dbError || !order) {
      return new Response(
        JSON.stringify({ error: dbError?.message || "Failed to create order in DB" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Create Razorpay order ──
    const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;

    const razorpayRes = await createRazorpayOrder({
      amount: totalPaise,
      currency: "INR",
      // receipt + notes.db_order_id let the webhook / reconciliation find this order
      // even if saving razorpay_order_id below were ever to fail.
      receipt: order.id,
      notes: { db_order_id: order.id, customer_name: noteValue(customerName), customer_phone: noteValue(customer.phone) },
    });
    const razorpayOrder = razorpayRes.json;

    if (!razorpayRes.ok || !razorpayOrder?.id) {
      console.error("[create-order] Razorpay order failed", order.id, razorpayRes.status, razorpayOrder?.error);
      return new Response(
        JSON.stringify({ error: "Payment gateway is busy. Please try again in a moment." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Save Razorpay order ID to database ──
    // Must succeed before the customer can pay: without it the payment could never be
    // matched back to this order.
    const { error: linkErr } = await supabase
      .from("orders")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", order.id);

    if (linkErr) {
      console.error("[create-order] could not save razorpay_order_id", order.id, razorpayOrder.id, linkErr.message);
      return new Response(
        JSON.stringify({ error: "Could not start payment. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Meta Conversions API ──
    // Kept as a separate update so checkout keeps working even before
    // docs/sql/meta-capi.sql has added the column.
    const client = clientContextFromRequest(req, tracking);
    const { error: trackingErr } = await supabase
      .from("orders")
      .update({ meta_tracking: toStoredTracking(client, customer) })
      .eq("id", order.id);
    if (trackingErr) console.error("[meta-capi] could not store meta_tracking:", trackingErr.message);

    // Same event_id as the browser InitiateCheckout, so Meta counts the pair once.
    await runInBackground(async () =>
      sendMetaEvents([
        {
          event_name: "InitiateCheckout",
          event_id: `checkout.${order.id}`,
          event_source_url: client.sourceUrl,
          user_data: await buildUserData(customer, client),
          custom_data: orderCustomData(validatedItems, totalPaise),
        },
      ])
    );

    return new Response(
      JSON.stringify({
        order_id: razorpayOrder.id,
        db_order_id: order.id,
        amount: totalPaise,
        key_id: keyId,
        customer: { name: customer.name, email: customer.email, phone: customer.phone },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[create-order] error", e instanceof Error ? e.message : e);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
