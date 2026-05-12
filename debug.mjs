import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const eq = line.indexOf('=');
  if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
});
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function main() {
  // Try a simple update on one field to test RLS
  const { data, error } = await supabase
    .from('pujas')
    .update({ about: 'test content' })
    .eq('id', 'd341de69-2251-4291-bb22-fa4738a61e15')
    .select('id, about');
  
  console.log('Data:', JSON.stringify(data));
  console.log('Error:', error ? JSON.stringify(error) : 'none');
}
main();
