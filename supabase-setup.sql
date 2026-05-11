-- ============================================================
-- Narayan Kripa — Supabase Database Setup
-- Run this ENTIRE script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create pujas table
CREATE TABLE pujas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  deity TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  image_url TEXT,
  prices JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create chadhavas table
CREATE TABLE chadhavas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  temple TEXT NOT NULL,
  item TEXT NOT NULL,
  price INTEGER NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pujas_updated_at
  BEFORE UPDATE ON pujas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER chadhavas_updated_at
  BEFORE UPDATE ON chadhavas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Enable Row Level Security
ALTER TABLE pujas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chadhavas ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies — Public can read active, admin can do everything
CREATE POLICY "Public read active pujas"
  ON pujas FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admin full access pujas"
  ON pujas FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Public read active chadhavas"
  ON chadhavas FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admin full access chadhavas"
  ON chadhavas FOR ALL
  USING (auth.role() = 'authenticated');

-- 6. Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- 7. Storage policies
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- 8. Seed data — existing pujas
INSERT INTO pujas (name, deity, location, date, prices, status, featured) VALUES
  ('Ekadashi Special Badrinarayan Rakshaya Ka Watch', 'Vishnu', 'Badrinath Dham Shetra', '13 May',
   '[{"label":"Single","price":951},{"label":"Couple","price":1551},{"label":"4 Family","price":2551},{"label":"6 Members","price":3551}]',
   'active', true),
  ('Shani Jayanti Special Nav Greh Shanti Pooja & Tel Abhishek', 'Navgraha', 'Nav Greh Mandir Haridwar', '16 May',
   '[{"label":"Single","price":951},{"label":"Couple","price":1551},{"label":"4 Family","price":2551},{"label":"6 Members","price":3551}]',
   'active', true),
  ('Ganga Dussehra Special Maa Ganga Abhishek & Deep Daan', 'Ganga', 'Har Ki Pauri', '25 May',
   '[{"label":"Single","price":951},{"label":"Couple","price":1551},{"label":"4 Family","price":2551},{"label":"6 Members","price":3551}]',
   'active', true);

-- 9. Seed data — existing chadhavas
INSERT INTO chadhavas (temple, item, price, status) VALUES
  ('Kashi Vishwanath', 'Bel Patra & Dhatura', 251, 'active'),
  ('Tirupati Balaji', 'Tulsi Mala & Laddu Prasad', 501, 'active'),
  ('Siddhivinayak', 'Modak & Red Hibiscus', 351, 'active'),
  ('Vaishno Devi', 'Chunari & Sindoor', 451, 'active'),
  ('Mahakaleshwar', 'Bhasma Aarti Offering', 1100, 'active'),
  ('Jagannath Puri', 'Mahaprasad Offering', 651, 'active');
