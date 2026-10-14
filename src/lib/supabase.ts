import { createClient } from '@supabase/supabase-js';
import { supabaseClientUrl } from './supabaseUrl';

/** The project's own address. Stored image URLs and server-side callers use this one. */
export const SUPABASE_DIRECT_URL: string = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_URL = supabaseClientUrl(
  SUPABASE_DIRECT_URL,
  typeof window !== "undefined" ? window.location : undefined,
);

export const supabase = createClient(SUPABASE_URL, supabaseAnonKey, {
  // supabase-js names the saved login after the URL's host; keep the old name so nobody
  // (admin or customer) is logged out by the switch to /sb.
  auth: { storageKey: "sb-opztoxuohtizymhwofas-auth-token" },
});

/* Type definitions for database tables */

export interface Puja {
  id: string;
  name: string;
  deity?: string;
  location: string;
  date: string;
  countdown_datetime?: string | null;
  image_url: string | null;
  prices: { label: string; price: number }[];
  status: 'active' | 'draft';
  benefit: string | null;
  name_hi: string | null;
  location_hi: string | null;
  benefit_hi: string | null;
  featured?: boolean;
  occasion?: string | null;
  occasion_hi?: string | null;
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
  /** YouTube link to a past performance of this puja (docs/sql/reviews-and-proof.sql). */
  past_video_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chadhava {
  id: string;
  temple: string;
  item: string;
  date?: string | null;
  countdown_datetime?: string | null;
  price: number;
  image_url: string | null;
  description: string | null;
  item_hi: string | null;
  temple_hi: string | null;
  description_hi: string | null;
  occasion?: string | null;
  occasion_hi?: string | null;
  gallery?: string[];
  about?: string | null;
  about_hi?: string | null;
  faqs?: { question: string; answer: string }[];
  faqs_hi?: { question: string; answer: string }[];
  featured?: boolean;
  status: 'active' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface ChadhavaOffering {
  id: string;
  chadhava_id: string;
  name: string;
  name_hi: string | null;
  price: number;
  image_url: string | null;
  description: string | null;
  description_hi: string | null;
  status: 'active' | 'draft';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Temple {
  id: string;
  name: string;
  name_hi: string | null;
  city: string | null;
  state: string | null;
  state_hi: string | null;
  deity: string | null;
  deity_hi: string | null;
  timings: string | null;
  image_url: string | null;
  rating: number | null;
  reviews: number | null;
  established: string | null;
  best_time: string | null;
  description: string | null;
  description_hi: string | null;
  highlights: string[];
  highlights_hi: string[];
  sort_order: number;
  status: 'active' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface PujaOffering {
  id: string;
  puja_id: string;
  name: string;
  name_hi: string | null;
  price: number;
  image_url: string | null;
  description: string | null;
  description_hi: string | null;
  status: 'active' | 'draft';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

