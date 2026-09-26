-- ============================================================
-- Narayan Kripa — Manual (offline) payments and cancelled orders
-- Run once in: Supabase Dashboard → SQL Editor (or the Management API)
--
-- Why: a customer who abandons online checkout is often converted on a call and
-- pays by UPI / cash / bank transfer. The admin needs to mark that order paid,
-- with a record of how. Retry attempts that duplicate an already-paid order need
-- a "cancelled" status so they stop counting as pending.
-- ============================================================

-- How the order was paid: 'razorpay' | 'upi' | 'cash' | 'bank_transfer' | 'other'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Audit record for manual payments / cancellations:
--   { method, reference, amount_received, original_amount, note, marked_at, marked_by,
--     cancel_reason, cancelled_at }
ALTER TABLE orders ADD COLUMN IF NOT EXISTS manual_payment JSONB;

-- Existing online payments.
UPDATE orders SET payment_method = 'razorpay'
 WHERE status = 'paid' AND razorpay_payment_id IS NOT NULL AND payment_method IS NULL;

-- Allow 'cancelled' (duplicates / abandoned orders the admin closes).
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled'));

CREATE INDEX IF NOT EXISTS orders_customer_phone_idx ON orders (customer_phone);
