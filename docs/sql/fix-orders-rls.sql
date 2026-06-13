-- ============================================================
-- Narayan Kripa — Fix Orders RLS Security Issue
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================
--
-- PROBLEM: The "Allow order status update" policy uses USING (true)
-- which allows any anonymous user to update ANY order's status.
-- Edge Functions already use the service_role key which bypasses RLS,
-- so these permissive policies are unnecessary.
--
-- FIX: Drop the overly permissive policies and restrict writes
-- to the admin + service_role (which bypasses RLS automatically).
-- Edge Functions (create-order, verify-payment) use service_role
-- and are unaffected by RLS changes.
-- ============================================================

-- Step 1: Drop the overly permissive policies
DROP POLICY IF EXISTS "Allow order creation" ON orders;
DROP POLICY IF EXISTS "Allow order status update" ON orders;

-- Step 2: Create restrictive policies — admin only for direct DB access
-- (Edge Functions use service_role key which bypasses RLS entirely)
CREATE POLICY "Admin insert orders"
  ON orders FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = current_setting('app.settings.admin_email', true));

CREATE POLICY "Admin update orders"
  ON orders FOR UPDATE
  USING (auth.jwt() ->> 'email' = current_setting('app.settings.admin_email', true));

-- NOTE: If your Edge Functions use the anon key instead of service_role,
-- you'll need to keep the INSERT policy open. Check your Edge Function
-- environment to confirm. With service_role, these policies are correct.
