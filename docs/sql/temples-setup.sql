-- ============================================================
-- Narayan Kripa — Temples table setup
-- Run this ENTIRE script ONCE in: Supabase Dashboard → SQL Editor
-- Safe to re-run: uses IF NOT EXISTS / idempotent guards.
-- ============================================================

-- 1. Create temples table
CREATE TABLE IF NOT EXISTS temples (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  name_hi        TEXT,
  city           TEXT,
  state          TEXT,
  state_hi       TEXT,
  deity          TEXT,
  deity_hi       TEXT,
  timings        TEXT,
  image_url      TEXT,
  rating         NUMERIC(2,1) DEFAULT 4.8,
  reviews        INTEGER DEFAULT 0,
  established    TEXT,
  best_time      TEXT,
  description    TEXT,
  description_hi TEXT,
  highlights     TEXT[] DEFAULT '{}',
  highlights_hi  TEXT[] DEFAULT '{}',
  sort_order     INTEGER DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft')),
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- 2. Auto-update updated_at on row change
--    (update_updated_at() already exists from the main setup script)
DROP TRIGGER IF EXISTS temples_updated_at ON temples;
CREATE TRIGGER temples_updated_at
  BEFORE UPDATE ON temples
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Enable Row Level Security
ALTER TABLE temples ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — public reads active temples; only the admin email can write
DROP POLICY IF EXISTS "Public read active temples" ON temples;
CREATE POLICY "Public read active temples"
  ON temples FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Admin read all temples" ON temples;
CREATE POLICY "Admin read all temples"
  ON temples FOR SELECT
  USING (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');

DROP POLICY IF EXISTS "Admin insert temples" ON temples;
CREATE POLICY "Admin insert temples"
  ON temples FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');

DROP POLICY IF EXISTS "Admin update temples" ON temples;
CREATE POLICY "Admin update temples"
  ON temples FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');

DROP POLICY IF EXISTS "Admin delete temples" ON temples;
CREATE POLICY "Admin delete temples"
  ON temples FOR DELETE
  USING (auth.jwt() ->> 'email' = 'nkripra0206@gmail.com');

-- 5. Seed data — the 6 temples currently on the site.
--    image_url is left NULL; upload each temple's photo via Admin → Temples.
--    Only runs if the table is empty (idempotent).
INSERT INTO temples (name, name_hi, city, state, state_hi, deity, deity_hi, timings, rating, reviews, established, best_time, description, description_hi, highlights, highlights_hi, sort_order, status)
SELECT * FROM (VALUES
  ('Kashi Vishwanath', 'काशी विश्वनाथ', 'Varanasi', 'Uttar Pradesh', 'उत्तर प्रदेश', 'Shiva', 'शिव', '4 AM – 11 PM', 4.9, 12480, '11th Century', 'Oct – Mar',
   'One of the holiest temples in India, Kashi Vishwanath is dedicated to Lord Shiva and is located on the western bank of the sacred Ganges. It is one of the twelve Jyotirlingas — the holiest of Shiva shrines.',
   'भारत के सबसे पवित्र मंदिरों में से एक, काशी विश्वनाथ भगवान शिव को समर्पित है और पवित्र गंगा के पश्चिमी तट पर स्थित है।',
   ARRAY['12 Jyotirlinga','Ganga Aarti','Bhasma Aarti','Rudrabhishek'],
   ARRAY['12 ज्योतिर्लिंग','गंगा आरती','भस्म आरती','रुद्राभिषेक'], 1, 'active'),

  ('Tirupati Balaji', 'तिरुपति बालाजी', 'Tirupati', 'Andhra Pradesh', 'आंध्र प्रदेश', 'Vishnu', 'विष्णु', '3 AM – 10 PM', 4.9, 98400, '300 AD', 'Sep – Feb',
   'Sri Venkateswara Temple atop the Tirumala hills is the most visited religious site in the world. Dedicated to Lord Venkateswara, a form of Vishnu, it draws millions of devotees every year.',
   'तिरुमला की पहाड़ियों पर स्थित श्री वेंकटेश्वर मंदिर विश्व का सर्वाधिक दर्शनार्थियों वाला धार्मिक स्थल है।',
   ARRAY['Brahmotsavam','Kalyanotsavam','Suprabhatam','Tiruchanoor'],
   ARRAY['ब्रह्मोत्सवम्','कल्याणोत्सवम्','सुप्रभातम','तिरुचानूर'], 2, 'active'),

  ('Siddhivinayak', 'सिद्धिविनायक', 'Mumbai', 'Maharashtra', 'महाराष्ट्र', 'Ganesh', 'गणेश', '5:30 AM – 9:30 PM', 4.8, 34200, '1801 AD', 'Aug – Jan',
   'Shree Siddhivinayak Ganapati Mandir in Mumbai is one of the wealthiest temples in Maharashtra. The presiding deity Lord Ganapati is believed to fulfil all wishes of his devotees.',
   'मुंबई में श्री सिद्धिविनायक गणपति मंदिर महाराष्ट्र के सबसे धनी मंदिरों में से एक है।',
   ARRAY['Ganesh Chaturthi','Modak Prasad','Siddhivinayak Aarti','Tuesday Puja'],
   ARRAY['गणेश चतुर्थी','मोदक प्रसाद','सिद्धिविनायक आरती','मंगलवार पूजा'], 3, 'active'),

  ('Vaishno Devi', 'वैष्णो देवी', 'Katra', 'Jammu & Kashmir', 'जम्मू और कश्मीर', 'Durga', 'दुर्गा', '5 AM – 12 AM', 4.9, 56700, 'Ancient', 'Mar – Jul, Oct – Nov',
   'Located in the Trikuta Mountains, Vaishno Devi shrine is one of the holiest Hindu temples dedicated to Goddess Vaishno Devi — a manifestation of Maa Durga. Millions undertake the sacred yatra annually.',
   'त्रिकूट पर्वत में स्थित वैष्णो देवी मंदिर देवी वैष्णो देवी को समर्पित सबसे पवित्र हिंदू मंदिरों में से एक है।',
   ARRAY['Sacred Cave','Navratri Celebration','Bhawan Darshan','Ardh Kuwari'],
   ARRAY['पवित्र गुफा','नवरात्रि उत्सव','भवन दर्शन','अर्ध कुँवारी'], 4, 'active'),

  ('Jagannath Puri', 'जगन्नाथ पुरी', 'Puri', 'Odisha', 'ओडिशा', 'Vishnu', 'विष्णु', '5 AM – 9 PM', 4.8, 28900, '12th Century', 'Oct – Feb',
   'The Jagannath Temple in Puri is one of the Char Dham pilgrimage sites. Famous for the grand Rath Yatra festival, it is dedicated to Lord Jagannath — a form of Vishnu. The Mahaprasad is considered sacred.',
   'पुरी में जगन्नाथ मंदिर चार धाम तीर्थ स्थलों में से एक है। भव्य रथ यात्रा उत्सव के लिए प्रसिद्ध।',
   ARRAY['Rath Yatra','Mahaprasad','Snana Yatra','Navakalevara'],
   ARRAY['रथ यात्रा','महाप्रसाद','स्नान यात्रा','नवकलेवर'], 5, 'active'),

  ('Mahakaleshwar', 'महाकालेश्वर', 'Ujjain', 'Madhya Pradesh', 'मध्य प्रदेश', 'Shiva', 'शिव', '4 AM – 11 PM', 4.9, 19300, 'Ancient', 'Oct – Mar',
   'Mahakaleshwar Jyotirlinga is one of the twelve Jyotirlingas of Lord Shiva located in Ujjain, Madhya Pradesh. The unique Bhasma Aarti performed with sacred ash draws thousands of devotees daily.',
   'महाकालेश्वर ज्योतिर्लिंग भगवान शिव के बारह ज्योतिर्लिंगों में से एक है। भस्म आरती इस मंदिर की विशेषता है।',
   ARRAY['Bhasma Aarti','Jyotirlinga Darshan','Kumbh Mela','Mahashivratri'],
   ARRAY['भस्म आरती','ज्योतिर्लिंग दर्शन','कुंभ मेला','महाशिवरात्रि'], 6, 'active')
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM temples);
