-- ============================================================
-- Narayan Kripa — Why did a payment fail?
-- Run in: Supabase Dashboard → SQL Editor (or the Management API)
--
-- Why: ~30% of orders end unpaid, mostly from Facebook / Instagram in-app browsers,
-- but the reason (bank decline, UPI timeout, customer cancelled…) only lived in the
-- Razorpay dashboard. razorpay-webhook (payment.failed) and razorpay-callback now
-- store the last failure on the order:
--   { code, description, source, step, reason, method, payment_id, at }
--
-- Run BEFORE deploying the functions that write it.
-- ============================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_error JSONB;

-- Failure reasons over the last week:
--   SELECT payment_error->>'reason' reason, payment_error->>'method' method, count(*)
--     FROM orders WHERE payment_error IS NOT NULL AND created_at > now() - interval '7 days'
--    GROUP BY 1, 2 ORDER BY 3 DESC;
