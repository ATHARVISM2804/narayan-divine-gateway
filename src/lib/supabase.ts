import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ── Type definitions for database tables ── */

export interface Puja {
  id: string;
  name: string;
  deity?: string;
  location: string;
  date: string;
  image_url: string | null;
  prices: { label: string; price: number }[];
  status: 'active' | 'draft';
  benefit: string | null;
  name_hi: string | null;
  location_hi: string | null;
  benefit_hi: string | null;
  featured?: boolean;
  /* ── Enhanced detail fields ── */
  gallery?: string[];
  about?: string | null;
  about_hi?: string | null;
  benefits?: string[];
  benefits_hi?: string[];
  process_steps?: { title: string; description: string }[];
  process_steps_hi?: { title: string; description: string }[];
  temple_name?: string | null;
  temple_name_hi?: string | null;
  temple_description?: string | null;
  temple_description_hi?: string | null;
  temple_image?: string | null;
  faqs?: { question: string; answer: string }[];
  faqs_hi?: { question: string; answer: string }[];
  includes?: string[];
  includes_hi?: string[];
  created_at: string;
  updated_at: string;
}

export interface Chadhava {
  id: string;
  temple: string;
  item: string;
  price: number;
  image_url: string | null;
  description: string | null;
  item_hi: string | null;
  temple_hi: string | null;
  description_hi: string | null;
  status: 'active' | 'draft';
  created_at: string;
  updated_at: string;
}
