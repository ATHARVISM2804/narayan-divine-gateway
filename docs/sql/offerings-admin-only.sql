-- ============================================================
-- Narayan Kripa — only the admin may change offerings (prices!)
-- Run in: Supabase Dashboard → SQL Editor (safe to re-run)
-- ============================================================
--
-- puja_offerings and chadhava_offerings let ANY signed-in user insert, update and delete
-- rows ("Authenticated users can …", "Auth users manage offerings"). Customers sign in to
-- see their orders, so any customer could change an offering's price or delete it.
-- The admin also could not read hidden (draft) pooja offerings, so the admin panel showed
-- them only while they were live. Now: everyone reads active offerings, the admin reads
-- and writes everything, nobody else writes. Same admin check as admin-performance.sql.

-- ── puja_offerings ──
DROP POLICY IF EXISTS "Authenticated users can insert puja offerings" ON puja_offerings;
DROP POLICY IF EXISTS "Authenticated users can update puja offerings" ON puja_offerings;
DROP POLICY IF EXISTS "Authenticated users can delete puja offerings" ON puja_offerings;

DROP POLICY IF EXISTS "Admin manage puja offerings" ON puja_offerings;
CREATE POLICY "Admin manage puja offerings"
  ON puja_offerings FOR ALL
  USING (lower((select auth.jwt()) ->> 'email') = 'nkripa0206@gmail.com')
  WITH CHECK (lower((select auth.jwt()) ->> 'email') = 'nkripa0206@gmail.com');

-- "Anyone can view active puja offerings" (status = 'active') stays as it is.

-- ── chadhava_offerings ──
DROP POLICY IF EXISTS "Auth users manage offerings" ON chadhava_offerings;

DROP POLICY IF EXISTS "Admin manage chadhava offerings" ON chadhava_offerings;
CREATE POLICY "Admin manage chadhava offerings"
  ON chadhava_offerings FOR ALL
  USING (lower((select auth.jwt()) ->> 'email') = 'nkripa0206@gmail.com')
  WITH CHECK (lower((select auth.jwt()) ->> 'email') = 'nkripa0206@gmail.com');

-- "Anyone can read active offerings" (status = 'active') stays as it is.

-- Check:
-- SELECT tablename, policyname, cmd, roles, qual FROM pg_policies
--  WHERE tablename IN ('puja_offerings', 'chadhava_offerings') ORDER BY 1, 2;
