-- =============================================
-- Puja Offerings Table
-- Run this in your Supabase SQL Editor
-- =============================================

-- Create the puja_offerings table
CREATE TABLE IF NOT EXISTS puja_offerings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  puja_id UUID NOT NULL REFERENCES pujas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_hi TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  description TEXT,
  description_hi TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE puja_offerings ENABLE ROW LEVEL SECURITY;

-- Public read access for active offerings
CREATE POLICY "Anyone can view active puja offerings"
  ON puja_offerings FOR SELECT
  USING (status = 'active');

-- Authenticated users can manage (admin)
CREATE POLICY "Authenticated users can insert puja offerings"
  ON puja_offerings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update puja offerings"
  ON puja_offerings FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete puja offerings"
  ON puja_offerings FOR DELETE
  TO authenticated
  USING (true);

-- Index for fast lookups
CREATE INDEX idx_puja_offerings_puja_id ON puja_offerings(puja_id);
CREATE INDEX idx_puja_offerings_status ON puja_offerings(status);
