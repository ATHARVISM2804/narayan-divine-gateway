-- ============================================================
-- Narayan Kripa — bookings the admin enters by hand (admin panel → New Booking)
-- Run in: Supabase Dashboard → SQL Editor (safe to re-run)
-- Run BEFORE deploying admin-create-order and the metaCapi.ts that checks `source`.
-- ============================================================
--
-- source        'website' for checkout orders (every existing row), 'admin' for manual
--               bookings. Manual bookings are not sent to Meta as a Purchase.
-- admin_booking who entered it and when, how it is being paid ('paid' / 'link'), the
--               catalog total and why the amount was changed, if it was.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'website';
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_source_check;
ALTER TABLE orders ADD CONSTRAINT orders_source_check CHECK (source IN ('website', 'admin'));

ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_booking JSONB;
