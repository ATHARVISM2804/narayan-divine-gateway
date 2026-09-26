import { describe, expect, it } from "vitest";
import { csvCell, formatDateTimeIST, formatPhoneForCsv, slugify, toCsv } from "./csv";
import { ORDER_CSV_HEADERS, orderToCsvRow, type ExportableOrder } from "./orderExport";
import { LEAD_CSV_HEADERS, leadToCsvRow } from "./leadExport";

describe("leadToCsvRow", () => {
  it("exports the price in rupees as stored (was divided by 100)", () => {
    const row = leadToCsvRow({
      name: "Ram", phone: "+919876543210", puja_name: "PITRA SHANTI", package_label: "Couple ",
      price: 951, source: "puja_page", created_at: "2026-09-26T07:50:22Z",
    });
    expect(row).toHaveLength(LEAD_CSV_HEADERS.length);
    expect(row).toEqual(["2026-09-26 13:20", "Ram", "9876543210", "PITRA SHANTI", "Couple", 951, "puja_page"]);
  });
});

describe("csvCell", () => {
  it("quotes text and doubles embedded quotes", () => {
    expect(csvCell('Ram "Guru" Sharma')).toBe('"Ram ""Guru"" Sharma"');
    expect(csvCell("Delhi, India")).toBe('"Delhi, India"');
  });

  it("stops customer text from running as a spreadsheet formula", () => {
    expect(csvCell("=HYPERLINK(\"http://x\")")).toBe('"\'=HYPERLINK(""http://x"")"');
    expect(csvCell("+91 98765")).toBe("\"'+91 98765\"");
    expect(csvCell("-Kashyap")).toBe("\"'-Kashyap\"");
    expect(csvCell("@cmd")).toBe("\"'@cmd\"");
  });

  it("keeps numbers as numbers and flattens line breaks", () => {
    expect(csvCell(1551)).toBe('"1551"');
    expect(csvCell(-5)).toBe('"-5"');
    expect(csvCell("12A, Shanti Apts\nMG Road")).toBe('"12A, Shanti Apts MG Road"');
    expect(csvCell(null)).toBe('""');
  });

  it("builds a BOM-prefixed, CRLF file", () => {
    const csv = toCsv(["A", "B"], [["x", 1]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toBe('﻿"A","B"\r\n"x","1"\r\n');
  });
});

describe("formatPhoneForCsv", () => {
  it("returns 10-digit Indian mobiles so Excel shows them in full", () => {
    expect(formatPhoneForCsv("+916303100372")).toBe("6303100372");
    expect(formatPhoneForCsv("09876543210")).toBe("9876543210");
    expect(formatPhoneForCsv("98765 43210")).toBe("9876543210");
  });

  it("keeps anything else as typed", () => {
    expect(formatPhoneForCsv("1234567890")).toBe("1234567890");
    expect(formatPhoneForCsv("")).toBe("");
  });
});

describe("formatDateTimeIST", () => {
  it("formats in India time, unambiguous and sortable", () => {
    expect(formatDateTimeIST("2026-09-26T07:50:22Z")).toBe("2026-09-26 13:20");
    expect(formatDateTimeIST("2026-09-25T18:45:00+00:00")).toBe("2026-09-26 00:15");
    expect(formatDateTimeIST(null)).toBe("");
    expect(formatDateTimeIST("garbage")).toBe("");
  });
});

describe("slugify", () => {
  it("makes a safe file-name part", () => {
    expect(slugify("PITRA SHANTI AND PITRA DOSH NIVARAN POOJA • 26 Sep 2026 • Couple")).toBe(
      "pitra-shanti-and-pitra-dosh-nivaran-pooja-26-sep-2026-couple",
    );
  });
});

const base: ExportableOrder = {
  id: "31bc3067-1ec2-479a-8648-3c9327dc7b3b",
  created_at: "2026-09-26T07:50:22Z",
  paid_at: "2026-09-26T07:50:32Z",
  status: "paid",
  customer_name: "Uttam Singh Bhauryal",
  customer_phone: "9820127229",
  customer_email: null,
  customer_address: "12A Shanti Apts, MG Road, Mumbai - 400001",
  amount: 175100,
  razorpay_order_id: "order_Tgaa5Y6xTlGF48",
  razorpay_payment_id: "pay_TgaaGjhgHbPF7n",
  puja_details: { gotra: "", member_names: ["Uttam Singh Bhauryal", " Mrs Parvati Devi Bhauryal "] },
  items: [
    {
      id: "puja-9b2efc21-adb5-4d95-a0f5-c5abba7b13a6-Couple ",
      name: "PITRA SHANTI AND PITRA DOSH NIVARAN POOJA (Couple )",
      price: 1551, quantity: 1, category: "puja",
      puja_id: "9b2efc21-adb5-4d95-a0f5-c5abba7b13a6",
      puja_name: "PITRA SHANTI AND PITRA DOSH NIVARAN POOJA",
      puja_date: "26 September 2026",
      puja_location: "BRAHMA KAPAAL, BADRINATH",
      tier: "Couple ",
    },
    { id: "blessing-box", name: "Narayan Kripa Blessing Box", price: 200, quantity: 1, category: "addon" },
    { id: "offering-1", name: "Brahman bhoj", price: 101, quantity: 2, category: "offering" },
  ],
};

describe("orderToCsvRow", () => {
  const row = (o: ExportableOrder) => Object.fromEntries(ORDER_CSV_HEADERS.map((h, i) => [h, orderToCsvRow(o)[i]]));

  it("has one value per header", () => {
    expect(orderToCsvRow(base)).toHaveLength(ORDER_CSV_HEADERS.length);
  });

  it("exports the sankalp and the booked puja in their own columns", () => {
    const r = row(base);
    expect(r["Member Names"]).toBe("Uttam Singh Bhauryal, Mrs Parvati Devi Bhauryal");
    expect(r["No. of Members"]).toBe(2);
    expect(r["Gotra"]).toBe("Not provided");
    expect(r["Puja / Seva"]).toBe("PITRA SHANTI AND PITRA DOSH NIVARAN POOJA");
    expect(r["Puja Date"]).toBe("26 September 2026");
    expect(r["Location"]).toBe("BRAHMA KAPAAL, BADRINATH");
    expect(r["Package"]).toBe("Couple");
  });

  it("separates add-ons and the blessing box with its address", () => {
    const r = row(base);
    expect(r["Add-on Offerings"]).toBe("Brahman bhoj ×2 @₹101");
    expect(r["Blessing Box"]).toBe("Yes");
    expect(r["Delivery Address"]).toBe("12A Shanti Apts, MG Road, Mumbai - 400001");
    expect(r["Amount (₹)"]).toBe(1751);
    expect(r["Paid At (IST)"]).toBe("2026-09-26 13:20");
    expect(r["Order Ref"]).toBe("31BC3067");
  });

  it("shows a gotra that was given and leaves sankalp columns blank for non-puja orders", () => {
    expect(row({ ...base, puja_details: { gotra: " Kashyap ", member_names: ["A"] } })["Gotra"]).toBe("Kashyap");
    const chadhava = row({
      ...base,
      puja_details: null,
      items: [{ id: "chadhava-x", name: "Shani Shanti Mala Thali", price: 501, quantity: 1, category: "chadhava", chadhava_date: "3 October 2026", chadhava_temple: "Shani Dham" }],
    });
    expect(chadhava["Gotra"]).toBe("");
    expect(chadhava["No. of Members"]).toBe("");
    expect(chadhava["Puja / Seva"]).toBe("Shani Shanti Mala Thali");
    expect(chadhava["Puja Date"]).toBe("3 October 2026");
    expect(chadhava["Blessing Box"]).toBe("No");
    expect(chadhava["Delivery Address"]).toBe("");
  });

  it("does not show a paid time for unpaid orders", () => {
    expect(row({ ...base, status: "pending", paid_at: null })["Paid At (IST)"]).toBe("");
  });
});
