// WhatsApp messages the admin sends a customer (Orders and New Booking). Admin-only copy,
// so the emoji are intentional (see copyGuard.test.ts).
import { formatOrderItemLine, type OrderItem } from "./orderItems";

export interface MessageOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  amount: number; // paise
  items: OrderItem[] | null;
}

/** Indian phone → wa.me digits (prefixes 91 for bare 10-digit numbers). */
export const waNumber = (phone: string) => {
  const d = (phone || "").replace(/\D/g, "").replace(/^0+/, "");
  return d.length === 10 ? `91${d}` : d;
};

const itemLines = (o: MessageOrder) =>
  // Each line carries the puja date & place so the customer can spot a wrong-date booking.
  (o.items || []).map((i) => `• ${formatOrderItemLine(i)}${(i.quantity ?? 1) > 1 ? ` ×${i.quantity}` : ""}`).join("\n");

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;
const ref = (o: MessageOrder) => o.id.slice(0, 8).toUpperCase();

/* Pre-filled order-confirmation message sent to the customer on WhatsApp. */
export const buildConfirmationMessage = (o: MessageOrder) => {
  const items = itemLines(o);
  return (
    `🙏 Namaste ${o.customer_name}!\n\n` +
    `Your booking with *Narayan Kripa* is confirmed ✅\n\n` +
    (items ? `🪔 *Your Seva:*\n${items}\n\n` : "") +
    `💰 *Amount:* ${rupees(o.amount)}\n` +
    `🧾 *Order Ref:* ${ref(o)}\n\n` +
    `Our team will perform your seva with full devotion and keep you updated. 🌺\n\n` +
    `Har Har Mahadev 🙏\n— Team Narayan Kripa`
  );
};

/** The customer's page for paying an order online (src/pages/PayOrder.tsx). */
export const payLink = (orderId: string, origin = window.location.origin) => `${origin}/pay/${orderId}`;

/* Payment link for a booking taken on a call, or a website order whose payment got stuck. */
export const buildPayLinkMessage = (o: MessageOrder, link: string) => {
  const items = itemLines(o);
  return (
    `🙏 Namaste ${o.customer_name}!\n\n` +
    `Thank you for booking with *Narayan Kripa*.\n\n` +
    (items ? `🪔 *Your Seva:*\n${items}\n\n` : "") +
    `💰 *Amount:* ${rupees(o.amount)}\n` +
    `🧾 *Order Ref:* ${ref(o)}\n\n` +
    `Please complete the payment here (UPI, card or net banking):\n${link}\n\n` +
    `Har Har Mahadev 🙏\n— Team Narayan Kripa`
  );
};

export const waLink = (phone: string, message: string) =>
  `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(message)}`;
