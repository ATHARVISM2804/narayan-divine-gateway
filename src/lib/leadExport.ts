// Admin → Leads → Export CSV.
import { formatDateTimeIST, formatPhoneForCsv, type CsvValue } from "./csv";

export interface ExportableLead {
  name: string;
  phone: string;
  puja_name: string | null;
  package_label: string | null;
  price: number | null; // rupees, as stored by submit-lead (e.g. 951)
  source: string | null;
  created_at: string;
}

export const LEAD_CSV_HEADERS = ["Date (IST)", "Name", "WhatsApp", "Puja", "Package", "Price (₹)", "Source"];

export const leadToCsvRow = (l: ExportableLead): CsvValue[] => [
  formatDateTimeIST(l.created_at),
  l.name,
  formatPhoneForCsv(l.phone),
  l.puja_name ?? "",
  (l.package_label ?? "").trim(),
  // Stored in rupees; the old export divided by 100 and showed ₹951 as "10".
  typeof l.price === "number" && l.price > 0 ? l.price : "",
  l.source ?? "",
];
