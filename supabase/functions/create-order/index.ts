// supabase/functions/create-order/index.ts
// Creates a Razorpay order with server-side price validation
// Deploy: supabase functions deploy create-order --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { items, customer } = await req.json();

    // Validate customer fields
    if (!customer?.name || !customer?.email || !customer?.phone) {
      return new Response(
        JSON.stringify({ error: "Name, email, and phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!items?.length) {
      return new Response(
        JSON.stringify({ error: "Cart is empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Server-side price recalculation (SECURITY: never trust frontend prices) ──
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let totalPaise = 0;
    const validatedItems = [];

    for (const item of items) {
      if (item.category === "puja") {
        // Puja items have id like "puja-<uuid>-<tier_label>"
        const parts = item.id.split("-");
        const pujaId = parts.slice(1, -1).join("-"); // extract UUID (handles hyphens in UUID)
        const tierLabel = parts[parts.length - 1];

        // Handle multi-word tier labels
        const fullTierLabel = item.id.replace(`puja-${pujaId}-`, "");

        const { data: puja } = await supabase
          .from("pujas")
          .select("name, prices")
          .eq("id", pujaId)
          .eq("status", "active")
          .single();

        if (!puja) {
          return new Response(
            JSON.stringify({ error: `Puja not found or inactive: ${item.name}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const tier = (puja.prices as { label: string; price: number }[]).find(
          (t) => t.label === fullTierLabel
        );
        if (!tier) {
          return new Response(
            JSON.stringify({ error: `Invalid tier: ${fullTierLabel}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        totalPaise += tier.price * 100 * (item.quantity || 1);
        validatedItems.push({ ...item, price: tier.price, verified: true });

      } else if (item.category === "chadhava") {
        // Chadhava items have id like "chadhava-<uuid>"
        const chadhavaId = item.id.replace("chadhava-", "");

        const { data: chadhava } = await supabase
          .from("chadhavas")
          .select("temple, item, price")
          .eq("id", chadhavaId)
          .eq("status", "active")
          .single();

        if (!chadhava) {
          return new Response(
            JSON.stringify({ error: `Chadhava not found or inactive: ${item.name}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        totalPaise += chadhava.price * 100 * (item.quantity || 1);
        validatedItems.push({ ...item, price: chadhava.price, verified: true });
      }
    }

    if (totalPaise <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid order amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Create order in database ──
    const { data: order, error: dbError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_address: customer.address || null,
        amount: totalPaise,
        items: validatedItems,
        status: "pending",
      })
      .select("id")
      .single();

    if (dbError || !order) {
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
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
        notes: {
          customer_name: customer.name,
          customer_email: customer.email,
        },
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

    // ── Return to frontend (only public key, never secret) ──
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
