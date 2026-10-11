-- ============================================================
-- Narayan Kripa — only the admin can read leads
-- Run this in: Supabase Dashboard → SQL Editor (safe to re-run)
-- ============================================================
--
-- The old rule let ANY signed-in user (e.g. a customer who logged in to see their
-- orders) read every lead's name and phone number. Now only the admin account can,
-- the same check the orders table uses. Inserting leads stays public: the lead form
-- falls back to a direct insert when the submit-lead function can't be reached.

DROP POLICY IF EXISTS "Admin read leads" ON leads;
CREATE POLICY "Admin read leads"
  ON leads FOR SELECT
  USING (lower(auth.jwt() ->> 'email') = 'nkripa0206@gmail.com');
