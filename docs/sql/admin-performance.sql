-- ============================================================
-- Narayan Kripa — admin panel speed + admin rules that actually match the admin
-- Run in: Supabase Dashboard → SQL Editor (safe to re-run)
-- ============================================================
--
-- 1. Indexes for what the admin panel asks for: newest-first lists of orders and
--    leads, and "every lead/order of this phone number" for the Contacted switch
--    (set_contacted in contacted-status.sql matches on public.phone_key(...)).
-- 2. Admin rules read the login once per query: `(select auth.jwt())` instead of
--    `auth.jwt()`, which Postgres re-evaluates for every row (Supabase advisor
--    "auth_rls_initplan").
-- 3. The temples and reviews admin rules compared against a misspelled address
--    (nkripra0206@…), so the admin could not add or edit temples or reviews. They
--    now use the real admin account, like orders and leads.
-- 4. orders had two dead rules (they compared against app.settings.admin_email,
--    which is not set) and two copies of the "customer reads own orders" rule.
--    Every rule is checked for every row, so the extras only cost time. The admin
--    keeps full access through "Admin full access orders".

-- ── 1. Indexes ──
CREATE INDEX IF NOT EXISTS leads_created_idx  ON leads  (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS leads_phone_key_idx  ON leads  (public.phone_key(phone));
CREATE INDEX IF NOT EXISTS orders_phone_key_idx ON orders (public.phone_key(customer_phone));

-- ── 2 + 4. orders ──
DROP POLICY IF EXISTS "Admin insert orders" ON orders;
DROP POLICY IF EXISTS "Admin update orders" ON orders;
DROP POLICY IF EXISTS "Users read own orders" ON orders;

DROP POLICY IF EXISTS "Admin full access orders" ON orders;
CREATE POLICY "Admin full access orders"
  ON orders FOR ALL
  USING (lower((select auth.jwt()) ->> 'email') = 'nkripa0206@gmail.com');

DROP POLICY IF EXISTS "Customers read own orders" ON orders;
CREATE POLICY "Customers read own orders"
  ON orders FOR SELECT
  USING (customer_email = (select auth.jwt()) ->> 'email');

-- ── 2. leads ──
DROP POLICY IF EXISTS "Admin read leads" ON leads;
CREATE POLICY "Admin read leads"
  ON leads FOR SELECT
  USING (lower((select auth.jwt()) ->> 'email') = 'nkripa0206@gmail.com');

-- ── 3. temples ──
DROP POLICY IF EXISTS "Admin read all temples" ON temples;
CREATE POLICY "Admin read all temples"
  ON temples FOR SELECT
  USING (lower((select auth.jwt()) ->> 'email') = 'nkripa0206@gmail.com');

DROP POLICY IF EXISTS "Admin insert temples" ON temples;
CREATE POLICY "Admin insert temples"
  ON temples FOR INSERT
  WITH CHECK (lower((select auth.jwt()) ->> 'email') = 'nkripa0206@gmail.com');

DROP POLICY IF EXISTS "Admin update temples" ON temples;
CREATE POLICY "Admin update temples"
  ON temples FOR UPDATE
  USING (lower((select auth.jwt()) ->> 'email') = 'nkripa0206@gmail.com');

DROP POLICY IF EXISTS "Admin delete temples" ON temples;
CREATE POLICY "Admin delete temples"
  ON temples FOR DELETE
  USING (lower((select auth.jwt()) ->> 'email') = 'nkripa0206@gmail.com');

-- ── 3. reviews ──
DROP POLICY IF EXISTS "Admin read all reviews" ON reviews;
CREATE POLICY "Admin read all reviews"
  ON reviews FOR SELECT
  USING (lower((select auth.jwt()) ->> 'email') = 'nkripa0206@gmail.com');

DROP POLICY IF EXISTS "Admin insert reviews" ON reviews;
CREATE POLICY "Admin insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (lower((select auth.jwt()) ->> 'email') = 'nkripa0206@gmail.com');

DROP POLICY IF EXISTS "Admin update reviews" ON reviews;
CREATE POLICY "Admin update reviews"
  ON reviews FOR UPDATE
  USING (lower((select auth.jwt()) ->> 'email') = 'nkripa0206@gmail.com');

DROP POLICY IF EXISTS "Admin delete reviews" ON reviews;
CREATE POLICY "Admin delete reviews"
  ON reviews FOR DELETE
  USING (lower((select auth.jwt()) ->> 'email') = 'nkripa0206@gmail.com');
