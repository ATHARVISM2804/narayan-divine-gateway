// Spreadsheet-safe CSV building and downloading, shared by the admin exports.
//
// - UTF-8 BOM so Excel shows Hindi names and ₹ correctly
// - CRLF line endings (RFC 4180, what Excel expects)
// - every cell quoted; embedded quotes doubled
// - text that starts with = + - @ is prefixed with ' so Excel/Sheets never run it as a formula
//   (customers type names, addresses and gotra — this is the classic "CSV injection" hole)

export type CsvValue = string | number | null | undefined;

const FORMULA_START = /^[=+\-@\t\r]/;

/** One quoted CSV cell. Numbers are written as-is; text is protected against formula injection. */
export function csvCell(value: CsvValue): string {
  if (value === null || value === undefined) return '""';
  if (typeof value === "number") return Number.isFinite(value) ? `"${value}"` : '""';
  let s = String(value).replace(/\r\n|\r|\n/g, " ").replace(/\s{2,}/g, " ").trim();
  if (FORMULA_START.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(headers: string[], rows: CsvValue[][]): string {
  const lines = [headers.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))];
  return "﻿" + lines.join("\r\n") + "\r\n";
}

/**
 * Indian mobile as 10 digits ("+91 98765-43210" → "9876543210"). Excel shows a plain
 * 10-digit number correctly; "+91…" would become 9.19E+11. Anything else is kept as typed.
 */
export function formatPhoneForCsv(phone?: string | null): string {
  const raw = (phone ?? "").trim();
  let d = raw.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : raw;
}

/** "2026-09-26 13:20" in India time — unambiguous and sortable in any spreadsheet. */
export function formatDateTimeIST(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(d).map((p) => [p.type, p.value]),
  );
  const hour = parts.hour === "24" ? "00" : parts.hour;
  return `${parts.year}-${parts.month}-${parts.day} ${hour}:${parts.minute}`;
}

/** Lowercase, dash-separated, safe for a file name. */
export function slugify(text: string, max = 60): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
}

/**
 * Saves the CSV. The link is attached to the page and the object URL is released a moment
 * later — revoking it immediately (as before) can cancel the download on Safari / iPhone.
 */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
