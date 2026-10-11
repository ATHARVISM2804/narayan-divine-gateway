-- ============================================================
-- Narayan Kripa: real reviews, past puja videos and booking counts
-- Run ONCE in Supabase Dashboard > SQL Editor (or via the Management API).
-- Safe to re-run: idempotent guards everywhere.
--
-- Run this BEFORE deploying the redesign that reads these objects. The site
-- hides the review and count sections if they are missing, so nothing breaks,
-- but the proof will not show until this has run.
-- ============================================================

-- 1. Reviews: entered by the admin from real WhatsApp / Google feedback.
CREATE TABLE IF NOT EXISTS reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  city         TEXT,
  city_hi      TEXT,
  rating       SMALLINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  text         TEXT,
  text_hi      TEXT,
  puja_id      UUID REFERENCES pujas(id) ON DELETE SET NULL,
  chadhava_id  UUID REFERENCES chadhavas(id) ON DELETE SET NULL,
  review_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  -- YouTube link (unlisted is fine). Never upload videos to Supabase Storage:
  -- the free plan's bandwidth quota took the site down on 28 Sep 2026.
  video_url    TEXT,
  photo_url    TEXT,
  featured     BOOLEAN NOT NULL DEFAULT false,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft')),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS reviews_updated_at ON reviews;
CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active reviews" ON reviews;
CREATE POLICY "Public read active reviews"
  ON reviews FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Admin read all reviews" ON reviews;
CREATE POLICY "Admin read all reviews"
  ON reviews FOR SELECT
  USING (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');

DROP POLICY IF EXISTS "Admin insert reviews" ON reviews;
CREATE POLICY "Admin insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');

DROP POLICY IF EXISTS "Admin update reviews" ON reviews;
CREATE POLICY "Admin update reviews"
  ON reviews FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');

DROP POLICY IF EXISTS "Admin delete reviews" ON reviews;
CREATE POLICY "Admin delete reviews"
  ON reviews FOR DELETE
  USING (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');

-- 2. Past puja video (YouTube link) shown as "Watch a past puja video".
ALTER TABLE pujas ADD COLUMN IF NOT EXISTS past_video_url TEXT;

-- 3. Public proof numbers, computed from paid orders.
--    orders is not readable by visitors (RLS), so this view runs with its
--    owner's rights and exposes only totals: never names, phones or amounts.
--    by_item maps a puja/chadhava id to the number of paid bookings for it.
CREATE OR REPLACE VIEW public_site_stats AS
WITH paid AS (
  SELECT o.customer_phone, i.item
    FROM orders o
    CROSS JOIN LATERAL jsonb_array_elements(o.items) AS i(item)
   WHERE o.status = 'paid'
),
raw AS (
  SELECT item->>'category' AS category,
         lower(coalesce(
           substring(item->>'id' from '^puja-([0-9a-fA-F-]{36})-'),
           substring(item->>'id' from '^chadhava-([0-9a-fA-F-]{36})$')
         )) AS ref_id
    FROM paid
   WHERE item->>'category' IN ('puja', 'chadhava')
),
-- Chadhava cart lines carry the OFFERING id; count them against their chadhava.
items AS (
  SELECT CASE
           WHEN r.category = 'chadhava' THEN coalesce(co.chadhava_id::text, r.ref_id)
           ELSE r.ref_id
         END AS product_id
    FROM raw r
    LEFT JOIN chadhava_offerings co
      ON r.category = 'chadhava' AND co.id::text = r.ref_id
)
SELECT
  (SELECT count(DISTINCT customer_phone) FROM orders WHERE status = 'paid')::int AS devotees,
  (SELECT count(*) FROM items)::int                                             AS bookings,
  (SELECT count(*) FROM temples WHERE status = 'active')::int                   AS temples,
  coalesce(
    (SELECT jsonb_object_agg(product_id, n)
       FROM (SELECT product_id, count(*)::int AS n FROM items WHERE product_id IS NOT NULL GROUP BY product_id) c),
    '{}'::jsonb
  ) AS by_item;

GRANT SELECT ON public_site_stats TO anon, authenticated;
