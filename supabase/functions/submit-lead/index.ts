// supabase/functions/submit-lead/index.ts
// Saves a puja lead and reports it to Meta as a server-side Lead event
// Deploy: supabase functions deploy submit-lead --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildUserData,
  clientContextFromRequest,
  runInBackground,
  sendMetaEvents,
} from "../_shared/metaCapi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const text = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { name, phone, puja_name, package_label, price, source, event_id, tracking } = await req.json();

    const leadName = text(name, 100);
    const leadPhone = text(phone, 20);
    if (!leadName || !/^\d{10}$/.test(leadPhone)) {
      return json({ error: "A name and a valid 10-digit phone number are required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const pujaName = text(puja_name);
    const packageLabel = text(package_label);
    const leadPrice = Number.isFinite(Number(price)) ? Number(price) : null;

    const { error: dbError } = await supabase.from("leads").insert({
      name: leadName,
      phone: leadPhone,
      puja_name: pujaName,
      package_label: packageLabel,
      price: leadPrice,
      source: text(source, 50) || "puja_page",
    });

    if (dbError) {
      console.error("submit-lead insert failed:", dbError.message);
      return json({ error: "Failed to save lead" }, 500);
    }

    // Same event_id as the browser Lead, so Meta counts the pair once.
    const client = clientContextFromRequest(req, tracking);
    const eventId = typeof event_id === "string" && /^[\w.:-]{1,100}$/.test(event_id)
      ? event_id
      : `lead.${crypto.randomUUID()}`;

    await runInBackground(async () =>
      sendMetaEvents([
        {
          event_name: "Lead",
          event_id: eventId,
          event_source_url: client.sourceUrl,
          user_data: await buildUserData({ name: leadName, phone: leadPhone }, client),
          custom_data: {
            content_name: `${pujaName} (${packageLabel})`,
            value: leadPrice ?? undefined,
            currency: "INR",
          },
        },
      ])
    );

    return json({ success: true });
  } catch (err) {
    console.error("submit-lead error:", err);
    return json({ error: "Server error" }, 500);
  }
});
