-- ============================================================
-- Customer can read their own orders (matched by email)
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE POLICY "Customers read own orders"
  ON orders FOR SELECT
  USING (
    customer_email = auth.jwt() ->> 'email'
  );
