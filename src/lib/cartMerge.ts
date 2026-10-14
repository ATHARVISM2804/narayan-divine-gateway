import type { CartItem } from "@/context/CartContext";

/**
 * Adds an item to the cart. When the line is already there (same id) its quantity grows
 * and its price, name, description and image are taken from the item being added — the
 * page's current data. Keeping the stored copy left a days-old price (₹951) on a line the
 * page now shows at the admin's new price.
 */
export function mergeCartItem(items: CartItem[], add: Omit<CartItem, "quantity">, quantity = 1): CartItem[] {
  if (!items.some((i) => i.id === add.id)) return [...items, { ...add, quantity }];
  return items.map((i) => (i.id === add.id ? { ...i, ...add, quantity: i.quantity + quantity } : i));
}
