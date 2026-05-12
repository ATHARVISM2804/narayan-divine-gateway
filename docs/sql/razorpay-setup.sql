-- ============================================================
-- Narayan Kripa — Orders Table Setup
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Razorpay fields
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,

  -- Customer details
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,

  -- Order details
  amount INTEGER NOT NULL,            -- in paise (₹951 = 95100)
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  items JSONB NOT NULL DEFAULT '[]',  -- snapshot of cart items at time of order

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Auto-update updated_at
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — orders are private, only admin can see
CREATE POLICY "Admin full access orders"
  ON orders FOR ALL
  USING (auth.role() = 'authenticated');

-- 5. Allow Edge Functions to insert/update orders (service role bypasses RLS,
--    but for anon-key calls we need a policy for inserts from checkout)
CREATE POLICY "Allow order creation"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow order status update"
  ON orders FOR UPDATE
  USING (true);
