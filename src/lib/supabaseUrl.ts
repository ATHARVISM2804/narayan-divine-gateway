/**
 * Some Indian ISPs (Airtel, Oct 2026) answer DNS for *.supabase.co with a dead address, so on
 * those networks login, the admin panel and payments hang. On the live site the browser talks
 * to Supabase through our own domain instead: vercel.json rewrites /sb/* to the project. It
 * also saves mobile visitors a second DNS lookup and TLS handshake.
 */
export function supabaseClientUrl(direct: string, loc?: { hostname: string; origin: string }): string {
  return loc && /(^|\.)narayankripa\.in$/.test(loc.hostname) ? `${loc.origin}/sb` : direct;
}
