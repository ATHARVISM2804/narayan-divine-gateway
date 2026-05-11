-- ============================================================
-- Narayan Kripa — Fix Admin Security (RLS Policies)
-- 
-- HOW TO RUN:
-- 1. Open https://supabase.com/dashboard
-- 2. Select your Narayan Kripa project
-- 3. Go to "SQL Editor" (left sidebar)
-- 4. Paste this ENTIRE script
-- 5. Click "Run"
-- 6. You should see "Success. No rows returned" — that means it worked!
--
-- WHAT THIS DOES:
-- Before: ANY logged-in user could modify your pujas/chadhavas/orders
-- After:  ONLY nkripra0206@gmail.com can modify data
--         Regular customers can only READ active pujas/chadhavas
-- ============================================================


-- ──────────────────────────────────────────
-- STEP 1: Remove old unsafe rules
-- ──────────────────────────────────────────

DROP POLICY IF EXISTS "Admin full access pujas" ON pujas;
DROP POLICY IF EXISTS "Public read active pujas" ON pujas;
DROP POLICY IF EXISTS "Admin read all pujas" ON pujas;
DROP POLICY IF EXISTS "Admin insert pujas" ON pujas;
DROP POLICY IF EXISTS "Admin update pujas" ON pujas;
DROP POLICY IF EXISTS "Admin delete pujas" ON pujas;

DROP POLICY IF EXISTS "Admin full access chadhavas" ON chadhavas;
DROP POLICY IF EXISTS "Public read active chadhavas" ON chadhavas;
DROP POLICY IF EXISTS "Admin read all chadhavas" ON chadhavas;
DROP POLICY IF EXISTS "Admin insert chadhavas" ON chadhavas;
DROP POLICY IF EXISTS "Admin update chadhavas" ON chadhavas;
DROP POLICY IF EXISTS "Admin delete chadhavas" ON chadhavas;

DROP POLICY IF EXISTS "Admin full access orders" ON orders;
DROP POLICY IF EXISTS "Users read own orders" ON orders;


-- ──────────────────────────────────────────
-- STEP 2: Secure PUJAS table
-- ──────────────────────────────────────────

-- Anyone can see active pujas (needed for the website to work)
CREATE POLICY "Public read active pujas"
  ON pujas FOR SELECT
  USING (status = 'active');

-- Only admin can see ALL pujas (including drafts in admin panel)
CREATE POLICY "Admin read all pujas"
  ON pujas FOR SELECT
  USING (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');

-- Only admin can create pujas
CREATE POLICY "Admin insert pujas"
  ON pujas FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');

-- Only admin can edit pujas
CREATE POLICY "Admin update pujas"
  ON pujas FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');

-- Only admin can delete pujas
CREATE POLICY "Admin delete pujas"
  ON pujas FOR DELETE
  USING (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');


-- ──────────────────────────────────────────
-- STEP 3: Secure CHADHAVAS table
-- ──────────────────────────────────────────

-- Anyone can see active chadhavas
CREATE POLICY "Public read active chadhavas"
  ON chadhavas FOR SELECT
  USING (status = 'active');

-- Only admin can see ALL chadhavas (including drafts)
CREATE POLICY "Admin read all chadhavas"
  ON chadhavas FOR SELECT
  USING (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');

-- Only admin can create chadhavas
CREATE POLICY "Admin insert chadhavas"
  ON chadhavas FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');

-- Only admin can edit chadhavas
CREATE POLICY "Admin update chadhavas"
  ON chadhavas FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');

-- Only admin can delete chadhavas
CREATE POLICY "Admin delete chadhavas"
  ON chadhavas FOR DELETE
  USING (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');


-- ──────────────────────────────────────────
-- STEP 4: Secure ORDERS table
-- ──────────────────────────────────────────

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Admin can see and manage ALL orders
CREATE POLICY "Admin full access orders"
  ON orders FOR ALL
  USING (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');

-- Regular users can see their own orders (matched by their email)
CREATE POLICY "Users read own orders"
  ON orders FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND customer_email = (auth.jwt() ->> 'email')
  );

-- NOTE: Edge functions use SUPABASE_SERVICE_ROLE_KEY which
-- bypasses RLS entirely, so order creation during checkout
-- will continue to work without any changes.


-- ──────────────────────────────────────────
-- DONE! Your database is now secured.
-- ──────────────────────────────────────────
