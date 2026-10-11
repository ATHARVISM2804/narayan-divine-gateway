-- ============================================================
-- Narayan Kripa — "Contacted / Not contacted" for leads and orders
-- Run this in: Supabase Dashboard → SQL Editor (safe to re-run)
-- Run it BEFORE deploying the admin code that reads contacted_at.
-- ============================================================
--
-- Admin → Leads and Admin → Orders have a switch on every card. Switching it marks
-- every lead and order with that phone number as contacted (or clears them all), so a
-- customer who left three leads and one order is followed up once.
-- NULL = not contacted; otherwise when the admin first marked it.

ALTER TABLE leads  ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ;

-- A phone number's comparable digits: "+91 96908-88667", "919690888667" and
-- "09690888667" all become "9690888667".
-- Keep in sync with phoneKey() in src/lib/orderSearch.ts.
CREATE OR REPLACE FUNCTION public.phone_key(raw TEXT)
RETURNS TEXT
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN length(d) = 12 AND d LIKE '91%' THEN substr(d, 3)
    WHEN length(d) = 11 AND d LIKE '0%'  THEN substr(d, 2)
    ELSE d
  END
  FROM (SELECT regexp_replace(coalesce(raw, ''), '\D', '', 'g') AS d) s
$$;

-- Mark (or clear) every lead and order of one phone number, in one transaction.
-- Marking keeps an earlier contacted_at; clearing sets them all back to NULL.
-- Returns the time it was marked (NULL when cleared).
-- SECURITY DEFINER so the admin can change only this column of leads (leads has no
-- UPDATE policy); the admin check is the same one as the "Admin full access orders" policy.
CREATE OR REPLACE FUNCTION public.set_contacted(p_phone TEXT, p_contacted BOOLEAN)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  k  TEXT := public.phone_key(p_phone);
  ts TIMESTAMPTZ := CASE WHEN p_contacted THEN now() END;
BEGIN
  IF lower(coalesce(auth.jwt() ->> 'email', '')) <> 'nkripa0206@gmail.com' THEN
    RAISE EXCEPTION 'Only the admin can do this' USING ERRCODE = '42501';
  END IF;
  IF length(k) < 10 THEN
    RAISE EXCEPTION 'Invalid phone number' USING ERRCODE = '22023';
  END IF;

  UPDATE leads
     SET contacted_at = CASE WHEN p_contacted THEN coalesce(contacted_at, ts) END
   WHERE public.phone_key(phone) = k;

  UPDATE orders
     SET contacted_at = CASE WHEN p_contacted THEN coalesce(contacted_at, ts) END
   WHERE public.phone_key(customer_phone) = k;

  RETURN ts;
END;
$$;

REVOKE ALL ON FUNCTION public.set_contacted(TEXT, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_contacted(TEXT, BOOLEAN) TO authenticated;
