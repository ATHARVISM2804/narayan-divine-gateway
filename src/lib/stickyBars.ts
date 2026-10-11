/* Which fixed bottom bar a route shows, so the floating buttons never overlap. */

/** Pages that render their own StickyActionBar: puja/chadhava detail and the cart. */
export const hasBookingBar = (pathname: string) => /^\/(puja|chadhava)\/[^/]+\/?$/.test(pathname) || /^\/cart\/?$/.test(pathname);

const CART_BAR_HIDDEN = ["/checkout", "/order-success", "/cart"];

/** The floating mobile cart summary. */
export const showsCartBar = (pathname: string, totalItems: number) =>
  totalItems > 0 && !hasBookingBar(pathname) && !CART_BAR_HIDDEN.some((p) => pathname.startsWith(p));
