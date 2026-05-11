-- ============================================================
-- SECURITY FIX: Remove overly permissive order policies
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Remove the dangerous "anyone can insert/update" policies
DROP POLICY IF EXISTS "Allow order creation" ON orders;
DROP POLICY IF EXISTS "Allow order status update" ON orders;

-- Edge Functions use SERVICE_ROLE_KEY which bypasses RLS,
-- so they can still create and update orders without these policies.
-- Only admin and the customer themselves can read orders now.
