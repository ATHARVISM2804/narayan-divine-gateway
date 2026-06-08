// supabase/functions/create-order/index.ts
// Creates a Razorpay order with server-side price validation
// Deploy: supabase functions deploy create-order --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

function err(msg: string, status = 400) {
  return new Response(
    JSON.stringify({ error: msg }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { items, customer, puja_details } = await req.json();

    if (!customer?.name || !customer?.phone) return err("Name and phone are required");
    if (!items?.length) return err("Cart is empty");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let totalPaise = 0;
    const validatedItems = [];

    for (const item of items) {

      // ── Puja tier ──
      if (item.category === "puja") {
        const match = PUJA_ID_RE.exec(item.id);
        if (!match) return err(`Invalid puja item ID format: ${item.id}`);
        const [, pujaId, tierLabel] = match;

        const { data: puja } = await supabase
          .from("pujas")
          .select("name, prices")
          .eq("id", pujaId)
          .eq("status", "active")
          .single();

        if (!puja) return err(`Puja not found or inactive: ${item.name}`);

        const tier = (puja.prices as { label: string; price: number }[])
          .find((t) => t.label === tierLabel);
        if (!tier) return err(`Invalid tier "${tierLabel}" for puja: ${puja.name}`);

        totalPaise += tier.price * 100 * (item.quantity || 1);
        validatedItems.push({ ...item, price: tier.price, verified: true });

      // ── Chadhava offering ──
      } else if (item.category === "chadhava") {
        const match = CHADHAVA_ID_RE.exec(item.id);
        if (!match) return err(`Invalid chadhava item ID format: ${item.id}`);
        const [, offeringId] = match;

        const { data: offering } = await supabase
          .from("chadhava_offerings")
          .select("name, price")
          .eq("id", offeringId)
          .eq("status", "active")
          .single();

        if (!offering) return err(`Chadhava offering not found or inactive: ${item.name}`);

        totalPaise += offering.price * 100 * (item.quantity || 1);
        validatedItems.push({ ...item, price: offering.price, verified: true });

      // ── Puja add-on offering ──
      } else if (item.category === "offering") {
        const match = OFFERING_ID_RE.exec(item.id);
        if (!match) return err(`Invalid offering item ID format: ${item.id}`);
        const [, offeringId] = match;

        const { data: offering } = await supabase
          .from("puja_offerings")
          .select("name, price")
          .eq("id", offeringId)
          .eq("status", "active")
          .single();

        if (!offering) return err(`Puja offering not found or inactive: ${item.name}`);

        totalPaise += offering.price * 100 * (item.quantity || 1);
        validatedItems.push({ ...item, price: offering.price, verified: true });

      // ── Blessing box (fixed price, no DB record) ──
      } else if (item.category === "addon" && item.id === "blessing-box") {
        totalPaise += BLESSING_BOX_PRICE * 100 * (item.quantity || 1);
        validatedItems.push({ ...item, price: BLESSING_BOX_PRICE, verified: true });

      // ── Unknown category — reject to avoid price manipulation ──
      } else {
        return err(`Unknown item category: ${item.category}`);
      }
    }

    if (totalPaise <= 0) return err("Invalid order amount");

    // ── Create order in database ──
    const { data: order, error: dbError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name,
        customer_email: customer.email || null,
        customer_phone: customer.phone,
        customer_address: customer.address || null,
        amount: totalPaise,
        items: validatedItems,
        status: "pending",
        puja_details: puja_details || null,
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
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
      },
      body: JSON.stringify({
        amount: totalPaise,
        currency: "INR",
        receipt: order.id,
        notes: { customer_name: customer.name, customer_phone: customer.phone },
      }),
    });

    const razorpayOrder = await razorpayRes.json();

    if (!razorpayRes.ok) {
      return new Response(
        JSON.stringify({ error: razorpayOrder.error?.description || "Razorpay order failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Save Razorpay order ID to database ──
    await supabase
      .from("orders")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", order.id);

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
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
