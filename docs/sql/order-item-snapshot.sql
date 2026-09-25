-- ============================================================
-- Narayan Kripa — Backfill puja/chadhava snapshot onto existing order lines
-- Run once in: Supabase Dashboard → SQL Editor (or the Management API)
--
-- Why: order lines used to store only "puja-<uuid>-<tier>" + the puja name.
-- Two pujas can share a name (same puja, different dates), so the admin panel
-- could not tell which one was booked. create-order now stores puja_id,
-- puja_name, puja_date, puja_location and tier on every new line; this adds
-- the same fields to old lines whose puja still exists. Lines whose puja was
-- deleted are left untouched (their date is no longer knowable).
-- Safe to re-run: lines that already carry puja_date are skipped.
-- ============================================================

WITH enriched AS (
  SELECT
    o.id AS order_id,
    jsonb_agg(
      CASE
        WHEN i.item->>'category' = 'puja'
         AND i.item->>'puja_date' IS NULL
         AND p.id IS NOT NULL
        THEN i.item || jsonb_build_object(
               'puja_id',       p.id::text,
               'puja_name',     p.name,
               'puja_date',     p.date,
               'puja_location', p.location,
               'tier',          substring(i.item->>'id' from '^puja-[0-9a-fA-F-]{36}-(.+)$')
             )
        WHEN i.item->>'category' = 'chadhava'
         AND i.item->>'chadhava_date' IS NULL
         AND c.id IS NOT NULL
        THEN i.item || jsonb_build_object(
               'chadhava_id',     c.id::text,
               'chadhava_temple', c.temple,
               'chadhava_date',   c.date
             )
        ELSE i.item
      END
      ORDER BY i.ord
    ) AS items
  FROM orders o
  CROSS JOIN LATERAL jsonb_array_elements(o.items) WITH ORDINALITY AS i(item, ord)
  LEFT JOIN pujas p
    ON i.item->>'category' = 'puja'
   AND p.id::text = lower(substring(i.item->>'id' from '^puja-([0-9a-fA-F-]{36})-'))
  LEFT JOIN chadhavas c
    ON i.item->>'category' = 'chadhava'
   AND c.id::text = lower(substring(i.item->>'id' from '^chadhava-([0-9a-fA-F-]{36})$'))
  GROUP BY o.id
)
UPDATE orders o
   SET items = e.items
  FROM enriched e
 WHERE o.id = e.order_id
   AND o.items IS DISTINCT FROM e.items;

-- Check:
--   SELECT count(*) FILTER (WHERE i->>'puja_date' IS NOT NULL) AS with_date,
--          count(*) FILTER (WHERE i->>'puja_date' IS NULL)     AS without_date
--     FROM orders o CROSS JOIN jsonb_array_elements(o.items) i
--    WHERE i->>'category' = 'puja';
