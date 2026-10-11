// Admin → Orders → Export PDF. The list sent to Panditji for the sankalp: one row per order
// with only the customer's name, the members and the gotra — more columns made it hard to read.
// Filter the orders (Paid, puja, date) before exporting; the export is exactly what is shown.

import type { OrderItem } from "./orderItems";

export interface ExportableOrder {
  id: string;
  created_at: string;
  paid_at?: string | null;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  customer_address?: string | null;
  amount: number; // paise
  items?: OrderItem[] | null;
  puja_details?: { gotra?: string | null; member_names?: string[] | null } | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  payment_method?: string | null;
  manual_payment?: Record<string, unknown> | null;
}

export const PANDIT_LIST_HEADERS = ["Name", "Member Names", "Gotra"];

export function orderToPanditRow(o: ExportableOrder): string[] {
  const members = (o.puja_details?.member_names ?? []).map((m) => (m ?? "").trim()).filter(Boolean);
  const gotra = (o.puja_details?.gotra ?? "").trim();
  // Only puja bookings carry sankalp details; say so when the customer left the gotra blank.
  const gotraCell = o.puja_details ? gotra || "Not provided" : "";

  return [o.customer_name.trim(), members.join(", "), gotraCell];
}
