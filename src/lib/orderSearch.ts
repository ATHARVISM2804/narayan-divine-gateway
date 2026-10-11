// Admin → Orders search box: find every order of one customer by phone number,
// name (customer or a sankalp member), email, order ref or Razorpay id.
// Pure, so it can be unit-tested; runs over the orders already loaded in the page.

export interface SearchableOrder {
  id: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  puja_details?: { member_names?: (string | null)[] | null } | null;
}

/** Case-, width- and spacing-insensitive form of a string (works for Devanagari too). */
export const normalise = (s: string): string => s.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();

/**
 * A phone number's comparable digits: "+91 96908-88667", "919690888667" and
 * "09690888667" all become "9690888667". Numbers of other lengths keep all their digits.
 * Keep in sync with public.phone_key() in docs/sql/contacted-status.sql.
 */
export function phoneKey(raw: string | null | undefined): string {
  let digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

/** Only digits and phone punctuation, with enough digits to mean a number. */
const PHONE_QUERY_RE = /^[\d\s+\-()]+$/;
const MIN_PHONE_DIGITS = 3;

/** Everything an order can be found by, in one normalised string. */
export function searchText(order: SearchableOrder): string {
  return normalise(
    [
      order.customer_name,
      ...(order.puja_details?.member_names ?? []),
      order.customer_email,
      order.id,
      order.razorpay_order_id,
      order.razorpay_payment_id,
      phoneKey(order.customer_phone),
    ]
      .filter(Boolean)
      .join(" \u0001 "), // separator no query word can span
  );
}

/**
 * True if the order matches the search box text.
 * - Empty query: every order.
 * - A phone number (only digits / + - ( ) spaces, at least 3 digits): the order's phone
 *   contains it — partial numbers work, and +91 / leading 0 / spacing don't matter.
 * - Anything else: every word appears somewhere (name, member names, email, order ref,
 *   Razorpay ids, phone digits), so "amisha shah" and "amisha 9867" both work.
 */
export function orderMatchesSearch(order: SearchableOrder, query: string, haystack?: string): boolean {
  const q = normalise(query);
  if (!q) return true;

  if (PHONE_QUERY_RE.test(q)) {
    const digits = q.replace(/\D/g, "");
    if (digits.length >= MIN_PHONE_DIGITS) {
      const phone = phoneKey(order.customer_phone);
      // A half-typed "+91 9690…" or "09690…": try it with and without the prefix
      // (with, too — 9198… is itself a valid mobile number).
      const candidates = [phoneKey(digits)];
      if (digits.startsWith("91") && digits.length > 2) candidates.push(digits.slice(2));
      if (digits.startsWith("0") && digits.length > 1) candidates.push(digits.slice(1));
      // An all-digit order ref ("40213377") looks like a number too.
      return candidates.some((c) => phone.includes(c)) || order.id.toLowerCase().startsWith(digits);
    }
  }

  const text = haystack ?? searchText(order);
  return q.split(" ").every((word) => text.includes(word));
}
