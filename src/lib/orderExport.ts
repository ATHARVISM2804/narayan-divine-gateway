// Admin → Orders → Export CSV. One row per order, with the sankalp (members + gotra) and
// the booked puja's date / place / package in their own columns so the sheet can be
// sorted and filtered, e.g. "all 26 Sep bookings with their members and gotra".

import { canonicalTier, orderItemTier, type OrderItem } from "./orderItems";
import { pujaBaseName } from "./orderFilters";
import { formatDateTimeIST, formatPhoneForCsv, type CsvValue } from "./csv";

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

export const ORDER_CSV_HEADERS = [
  "Order Ref",
  "Booked At (IST)",
  "Paid At (IST)",
  "Status",
  "Payment Method",
  "Customer Name",
  "Phone",
  "Email",
  "Puja / Seva",
  "Puja Date",
  "Location",
  "Package",
  "Member Names",
  "No. of Members",
  "Gotra",
  "Add-on Offerings",
  "Blessing Box",
  "Delivery Address",
  "All Items",
  "Amount (₹)",
  "Razorpay Order ID",
  "Razorpay Payment ID",
  "Payment / Status Details",
  "Order ID",
];

const BLESSING_BOX_ID = "blessing-box";
const uniqueJoin = (values: (string | null | undefined)[]) =>
  [...new Set(values.map((v) => (v ?? "").trim()).filter(Boolean))].join(" | ");

const isSeva = (i: OrderItem) => i.category === "puja" || i.category === "chadhava";

const sevaName = (i: OrderItem) => (i.category === "puja" ? pujaBaseName(i) : (i.name || "").trim());
const sevaDate = (i: OrderItem) => (i.category === "puja" ? i.puja_date : i.chadhava_date) ?? "";
const sevaPlace = (i: OrderItem) => (i.category === "puja" ? i.puja_location : i.chadhava_temple) ?? "";

const METHOD_LABELS: Record<string, string> = {
  razorpay: "Razorpay", upi: "UPI (manual)", cash: "Cash (manual)", bank_transfer: "Bank transfer (manual)", other: "Other (manual)",
};

/** Reference / note of a manual payment, or why an order was cancelled. */
function paymentDetails(o: ExportableOrder): string {
  const mp = (o.manual_payment ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "");
  if (o.status === "cancelled") {
    return ["Cancelled", str(mp.cancel_reason)].filter(Boolean).join(": ");
  }
  if (o.status === "paid" && o.payment_method && o.payment_method !== "razorpay") {
    const parts = [
      str(mp.reference) && `Ref ${str(mp.reference)}`,
      typeof mp.original_amount === "number" && typeof mp.amount_received === "number" && mp.original_amount !== mp.amount_received
        ? `Order total ₹${(mp.original_amount / 100).toLocaleString("en-IN")}` : "",
      str(mp.note),
      str(mp.marked_by) && `marked by ${str(mp.marked_by)}`,
    ];
    return parts.filter(Boolean).join(" · ");
  }
  return "";
}

const lineText = (i: OrderItem) => `${i.name} ×${i.quantity || 1} @₹${Number(i.price).toLocaleString("en-IN")}`;

export function orderToCsvRow(o: ExportableOrder): CsvValue[] {
  const items = Array.isArray(o.items) ? o.items : [];
  const sevas = items.filter(isSeva);
  const addOns = items.filter((i) => !isSeva(i) && i.id !== BLESSING_BOX_ID);
  const hasBox = items.some((i) => i.id === BLESSING_BOX_ID);

  const members = (o.puja_details?.member_names ?? []).map((m) => (m ?? "").trim()).filter(Boolean);
  const gotra = (o.puja_details?.gotra ?? "").trim();
  // Only puja bookings carry sankalp details; say so when the customer left the gotra blank.
  const gotraCell = o.puja_details ? gotra || "Not provided" : "";

  return [
    o.id.slice(0, 8).toUpperCase(),
    formatDateTimeIST(o.created_at),
    o.status === "paid" ? formatDateTimeIST(o.paid_at) : "",
    o.status,
    o.status === "paid" ? METHOD_LABELS[o.payment_method || "razorpay"] ?? o.payment_method ?? "" : "",
    o.customer_name,
    formatPhoneForCsv(o.customer_phone),
    o.customer_email ?? "",
    uniqueJoin(sevas.map(sevaName)),
    uniqueJoin(sevas.map(sevaDate)),
    uniqueJoin(sevas.map(sevaPlace)),
    uniqueJoin(sevas.filter((i) => i.category === "puja").map((i) => canonicalTier(orderItemTier(i)))),
    members.join(", "),
    o.puja_details ? members.length : "",
    gotraCell,
    addOns.map(lineText).join(" | "),
    hasBox ? "Yes" : "No",
    hasBox ? o.customer_address ?? "" : "",
    items.map(lineText).join(" | "),
    Number((o.amount / 100).toFixed(2)),
    o.razorpay_order_id ?? "",
    o.razorpay_payment_id ?? "",
    paymentDetails(o),
    o.id,
  ];
}
