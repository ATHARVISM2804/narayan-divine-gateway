-- ============================================================
-- Narayan Kripa — Meta Conversions API support
-- Run this in: Supabase Dashboard → SQL Editor
-- Safe to run more than once.
-- ============================================================

-- Browser identifiers captured at checkout: fbp, fbc, ip, user_agent, source_url,
-- city, state, pincode. Used only to match server-side Meta events to the visitor.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS meta_tracking JSONB;

-- When the server-side Purchase was reported to Meta. verify-payment and
-- razorpay-webhook claim it atomically, so a paid order is reported exactly once.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS meta_purchase_sent_at TIMESTAMPTZ;
