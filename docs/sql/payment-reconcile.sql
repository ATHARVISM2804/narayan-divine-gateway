-- ============================================================
-- Narayan Kripa — Payment reconciliation with Razorpay
-- Run in: Supabase Dashboard → SQL Editor (or the Management API)
--
-- Why: an order only became "paid" when the customer's browser reported the
-- payment. Mobile UPI flows often kill that tab, so genuinely paid orders stayed
-- "pending". Razorpay is now the source of truth:
--   * paid_at            — when the money was captured (also used for Meta's event_time)
--   * a cron job every 10 minutes asks the reconcile-orders edge function to check
--     every unpaid order from the last 2 days against Razorpay.
--
-- Before running: `supabase secrets set RECONCILE_SECRET=<random>` and replace
-- <RECONCILE_SECRET> below with the same value (kept in Vault, not in the job text).
-- ============================================================

-- 1. Columns / indexes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS orders_razorpay_order_id_idx ON orders (razorpay_order_id);
CREATE INDEX IF NOT EXISTS orders_status_created_idx ON orders (status, created_at DESC);

-- Backfill: existing paid orders were paid roughly when their row was last updated.
UPDATE orders SET paid_at = updated_at WHERE status = 'paid' AND paid_at IS NULL;

-- 2. Scheduled reconciliation
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- The secret the cron job sends as x-reconcile-secret (must equal the edge function secret).
SELECT vault.create_secret('<RECONCILE_SECRET>', 'reconcile_secret', 'x-reconcile-secret header for reconcile-orders');

SELECT cron.unschedule('reconcile-razorpay-orders')
 WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'reconcile-razorpay-orders');

SELECT cron.schedule(
  'reconcile-razorpay-orders',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://opztoxuohtizymhwofas.supabase.co/functions/v1/reconcile-orders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-reconcile-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'reconcile_secret')
    ),
    body    := '{"all": true, "since_days": 2}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);

-- Check runs with:
--   SELECT jobid, status, return_message, start_time FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
