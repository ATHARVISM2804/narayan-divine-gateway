// Is this request from the signed-in admin? Checks the Supabase session token in the
// Authorization header against the ADMIN_EMAIL secret (the same account the admin panel uses).

// deno-lint-ignore no-explicit-any
export async function adminEmailFromRequest(req: Request, supabase: any): Promise<string | null> {
  const adminEmail = Deno.env.get("ADMIN_EMAIL")?.trim().toLowerCase();
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!adminEmail || !token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (error || !email || email !== adminEmail) return null;
  return email;
}
