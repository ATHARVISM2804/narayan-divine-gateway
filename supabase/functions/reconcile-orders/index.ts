// supabase/functions/reconcile-orders/index.ts
// Asks Razorpay whether unpaid orders were actually paid and fixes them.
// Deploy: supabase functions deploy reconcile-orders --no-verify-jwt
//
//   POST { order_id }                  public — one order; returns its (possibly updated) status.
//                                      Used by the success page, My Orders and the checkout fallback.
//   POST { all: true, since_days? }    sweep every unpaid order that has a Razorpay order id.
//                                      Needs header x-reconcile-secret = RECONCILE_SECRET (cron)
//                                      or the admin's Supabase session (email = ADMIN_EMAIL).
//
// Safe by construction: an order only becomes "paid" when Razorpay reports a captured
// payment for the exact order amount, so the public endpoint can't be abused.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { reconcileOrder, type ReconcilableOrder, type ReconcileResult } from "../_shared/razorpay.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-reconcile-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_SWEEP = 100;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORDER_COLUMNS = "id, status, amount, razorpay_order_id, razorpay_payment_id, paid_at, created_at";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// deno-lint-ignore no-explicit-any
async function isAdminRequest(req: Request, supabase: any): Promise<boolean> {
  const cronSecret = Deno.env.get("RECONCILE_SECRET");
  const provided = req.headers.get("x-reconcile-secret");
  if (cronSecret && provided && provided === cronSecret) return true;

  const adminEmail = Deno.env.get("ADMIN_EMAIL")?.trim().toLowerCase();
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!adminEmail || !token) return false;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.email) return false;
  return data.user.email.toLowerCase() === adminEmail;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Single order (public) ──
    if (typeof body?.order_id === "string") {
      if (!UUID_RE.test(body.order_id)) return json({ error: "Invalid order id" }, 400);

      const { data: order, error } = await supabase
        .from("orders")
        .select(ORDER_COLUMNS)
        .eq("id", body.order_id)
        .maybeSingle();
      if (error) return json({ error: "Lookup failed" }, 500);
      if (!order) return json({ error: "Order not found" }, 404);

      const result = await reconcileOrder(supabase, order as ReconcilableOrder);
      return json({ order: result });
    }

    // ── Sweep (cron / admin) ──
    if (body?.all === true) {
      if (!(await isAdminRequest(req, supabase))) return json({ error: "Unauthorized" }, 401);

      const sinceDays = Number(body.since_days);
      let query = supabase
        .from("orders")
        .select(ORDER_COLUMNS)
        .neq("status", "paid")
        .not("razorpay_order_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(MAX_SWEEP);
      if (Number.isFinite(sinceDays) && sinceDays > 0) {
        query = query.gte("created_at", new Date(Date.now() - sinceDays * 86_400_000).toISOString());
      }
      const { data: orders, error } = await query;
      if (error) return json({ error: "Lookup failed" }, 500);

      const markedPaid: ReconcileResult[] = [];
      const failures: { id: string; error: string }[] = [];
      for (const order of (orders ?? []) as ReconcilableOrder[]) {
        try {
          const result = await reconcileOrder(supabase, order);
          if (result.changed) markedPaid.push(result);
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          failures.push({ id: order.id, error: message });
          console.error("[reconcile] failed for", order.id, message);
        }
      }
      console.log(`[reconcile] checked ${orders?.length ?? 0}, marked paid ${markedPaid.length}, failed ${failures.length}`);
      return json({ checked: orders?.length ?? 0, marked_paid: markedPaid, failures });
    }

    return json({ error: "Provide order_id or all: true" }, 400);
  } catch (e) {
    console.error("[reconcile] error", e instanceof Error ? e.message : e);
    return json({ error: "Server error" }, 500);
  }
});
