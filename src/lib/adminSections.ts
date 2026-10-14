// Admin panel tabs live in the URL (/admin/orders, /admin/leads, …) so a reload,
// a bookmark or the back button keeps the admin on the tab they were using.

export const ADMIN_SECTIONS = ["dashboard", "booking", "pujas", "chadhavas", "temples", "reviews", "orders", "leads"] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

const isSection = (s: string): s is AdminSection => (ADMIN_SECTIONS as readonly string[]).includes(s);

/**
 * The tab named by the /admin/:section URL segment.
 * - No segment (plain /admin): "dashboard".
 * - An unknown segment: null, so the caller can send the admin back to /admin.
 */
export function sectionFromParam(param: string | undefined): AdminSection | null {
  if (!param) return "dashboard";
  const s = param.toLowerCase();
  return isSection(s) ? s : null;
}

/** The URL of a tab. The dashboard keeps the plain /admin address. */
export const adminPath = (section: AdminSection): string =>
  section === "dashboard" ? "/admin" : `/admin/${section}`;

/**
 * Where to go after signing in: back to the admin page that sent the admin to the
 * login screen, or /admin. Only same-site /admin pages are accepted (no open redirect).
 */
export function afterLoginPath(from: unknown): string {
  if (typeof from !== "string") return "/admin";
  if (!/^\/admin(\/[a-z]+)?\/?(\?[^#]*)?$/i.test(from)) return "/admin";
  if (/^\/admin\/login\b/i.test(from)) return "/admin";
  return from;
}
