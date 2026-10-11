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
import { isPlausiblePhone, linePaise, noteValue, validateCartLines } from "../_shared/orderPricing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Matches IDs like "puja-<uuid>-<tier label (may contain spaces or hyphens)>"
const PUJA_ID_RE = /^puja-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-(.+)$/i;

// Matches IDs like "chadhava-<uuid>"
const CHADHAVA_ID_RE = /^chadhava-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

// Matches IDs like "offering-<uuid>"
const OFFERING_ID_RE = /^offering-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

const BLESSING_BOX_PRICE = 200; // matches frontend constant

/** Sankalp details: trimmed gotra and member names, empty names dropped, lengths capped. */
function cleanPujaDetails(raw: unknown): { gotra: string; member_names: string[] } | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { gotra?: unknown; member_names?: unknown };
  const tidy = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
  const member_names = Array.isArray(r.member_names)
    ? r.member_names.map((n) => tidy(n, 100)).filter(Boolean).slice(0, 12)
    : [];
  return { gotra: tidy(r.gotra, 100), member_names };
}

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

const RAZORPAY_TIMEOUT_MS = 8000;

interface RazorpayResult {
  ok: boolean;
  status: number;
  json: { id?: string; error?: { description?: string } };
}

/** POST /v1/orders with a timeout and one retry on network errors, 429 and 5xx. */
async function createRazorpayOrder(body: unknown): Promise<RazorpayResult> {
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
    console.error(`[create-order] Razorpay attempt ${attempt} failed`, last.status, last.json?.error?.description);
    if (attempt === 1) await new Promise((r) => setTimeout(r, 400));
  }
  return last;
}

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

    let totalPaise = 0;
    const validatedItems: { id: string; price: number; quantity: number; [key: string]: unknown }[] = [];

    // Only the shape-checked fields of each line are used; names and prices come from the DB.
    for (const item of lines) {
      const base = { id: item.id, category: item.category, quantity: item.quantity };

      // ── Puja tier ──
      if (item.category === "puja") {
        const match = PUJA_ID_RE.exec(item.id);
        if (!match) return err(`Invalid pooja item ID format: ${item.id}`);
        const [, pujaId, tierLabel] = match;

        const { data: puja } = await supabase
          .from("pujas")
          .select("name, prices, date, location")
          .eq("id", pujaId)
          .eq("status", "active")
          .maybeSingle();

        if (!puja) return unavailable(`"${item.name}" is no longer available for booking`, item.id);

        const tier = ((puja.prices ?? []) as { label: string; price: number }[])
          .find((t) => t.label === tierLabel);
        if (!tier) return unavailable(`The "${tierLabel}" package of ${puja.name} has changed. Please choose it again.`, item.id);

        totalPaise += linePaise(tier.price, item.quantity);
        // Snapshot WHICH puja was booked. Several pujas can share a name (same puja on
        // different dates), and a puja may be edited or deleted later — the order must
        // keep its own record of the date and place the customer paid for.
        validatedItems.push({
          ...base,
          name: `${puja.name} (${tierLabel})`,
          price: tier.price,
          verified: true,
          puja_id: pujaId.toLowerCase(),
          puja_name: puja.name,
          puja_date: puja.date ?? null,
          puja_location: puja.location ?? null,
          tier: tierLabel,
        });

      // ── Chadhava offering ──
      } else if (item.category === "chadhava") {
        const match = CHADHAVA_ID_RE.exec(item.id);
        if (!match) return err(`Invalid chadhava item ID format: ${item.id}`);
        const [, offeringId] = match;

        const { data: offering } = await supabase
          .from("chadhava_offerings")
          .select("name, price, chadhava_id, chadhavas(temple, date)")
          .eq("id", offeringId)
          .eq("status", "active")
          .maybeSingle();

        if (!offering) return unavailable(`"${item.name}" is no longer available`, item.id);

        totalPaise += linePaise(offering.price, item.quantity);
        const chadhava = (Array.isArray(offering.chadhavas) ? offering.chadhavas[0] : offering.chadhavas) as
          | { temple?: string | null; date?: string | null }
          | null
          | undefined;
        validatedItems.push({
          ...base,
          name: offering.name,
          price: offering.price,
          verified: true,
          chadhava_id: offering.chadhava_id ?? null,
          chadhava_temple: chadhava?.temple ?? null,
          chadhava_date: chadhava?.date ?? null,
        });

      // ── Puja add-on offering ──
      } else if (item.category === "offering") {
        const match = OFFERING_ID_RE.exec(item.id);
        if (!match) return err(`Invalid offering item ID format: ${item.id}`);
        const [, offeringId] = match;

        const { data: offering } = await supabase
          .from("puja_offerings")
          .select("name, price, puja_id")
          .eq("id", offeringId)
          .eq("status", "active")
          .maybeSingle();

        if (!offering) return unavailable(`"${item.name}" is no longer available`, item.id);

        totalPaise += linePaise(offering.price, item.quantity);
        validatedItems.push({ ...base, name: offering.name, price: offering.price, verified: true, puja_id: offering.puja_id ?? null });

      // ── Blessing box (fixed price, no DB record) ──
      } else if (item.category === "addon" && item.id === "blessing-box") {
        totalPaise += linePaise(BLESSING_BOX_PRICE, item.quantity);
        validatedItems.push({ ...base, name: "Narayan Kripa Blessing Box", price: BLESSING_BOX_PRICE, verified: true });

      // ── Unknown add-on — reject to avoid price manipulation ──
      } else {
        return err(`Unknown item: ${item.id}`);
      }
    }

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
