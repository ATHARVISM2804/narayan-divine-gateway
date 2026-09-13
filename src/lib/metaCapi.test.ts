import { describe, expect, it } from "vitest";
import {
  buildUserData,
  normalizeEmail,
  normalizePhone,
  normalizePincode,
  normalizeText,
  orderCustomData,
  sha256Hex,
  splitName,
  validFbCookie,
} from "../../supabase/functions/_shared/metaCapi.ts";

describe("Meta Conversions API normalisation", () => {
  it("hashes a normalised email to Meta's documented value", async () => {
    // Example from Meta's customer information parameters docs.
    expect(await sha256Hex(normalizeEmail("  John_Smith@gmail.com ")!)).toBe(
      "62a14e44f765419d10fea99367361a727c12365e2520f32218d505ed9aa0f62f",
    );
  });

  it("drops values that are not emails", () => {
    expect(normalizeEmail("not-an-email")).toBeUndefined();
    expect(normalizeEmail(null)).toBeUndefined();
  });

  it("adds the 91 country code and strips symbols and leading zeros from phones", () => {
    expect(normalizePhone("9876543210")).toBe("919876543210");
    expect(normalizePhone("+91 98765-43210")).toBe("919876543210");
    expect(normalizePhone("09876543210")).toBe("919876543210");
    expect(normalizePhone("12345")).toBeUndefined();
  });

  it("splits names into first and last, lowercase without punctuation", () => {
    expect(splitName("  Ram  Kumar Sharma ")).toEqual({ fn: "ram", ln: "sharma" });
    expect(splitName("Sita")).toEqual({ fn: "sita", ln: undefined });
  });

  it("removes spaces from city/state and keeps Devanagari vowel signs", () => {
    expect(normalizeText("New Delhi")).toBe("newdelhi");
    expect(normalizeText("Uttar Pradesh")).toBe("uttarpradesh");
    expect(normalizeText("नई दिल्ली")).toBe("नईदिल्ली");
  });

  it("accepts only 6-digit Indian PIN codes", () => {
    expect(normalizePincode("110 001")).toBe("110001");
    expect(normalizePincode("012345")).toBeUndefined();
  });

  it("accepts only well-formed _fbp / _fbc values", () => {
    expect(validFbCookie("fb.1.1558571054389.1098115397")).toBe("fb.1.1558571054389.1098115397");
    expect(validFbCookie("garbage")).toBeUndefined();
    expect(validFbCookie(42)).toBeUndefined();
  });
});

describe("buildUserData", () => {
  it("hashes PII, passes browser identifiers through unhashed and skips empty fields", async () => {
    const userData = await buildUserData(
      { name: "Ram Sharma", phone: "9876543210", city: "New Delhi" },
      { fbp: "fb.1.1558571054389.1098115397", ip: "1.2.3.4", userAgent: "UA" },
    );

    expect(userData.ph).toBe(await sha256Hex("919876543210"));
    expect(userData.external_id).toBe(userData.ph);
    expect(userData.fn).toBe(await sha256Hex("ram"));
    expect(userData.ln).toBe(await sha256Hex("sharma"));
    expect(userData.ct).toBe(await sha256Hex("newdelhi"));
    expect(userData.country).toBe(await sha256Hex("in"));
    expect(userData.fbp).toBe("fb.1.1558571054389.1098115397");
    expect(userData.client_ip_address).toBe("1.2.3.4");
    expect(userData.client_user_agent).toBe("UA");
    expect(userData).not.toHaveProperty("em");
    expect(userData).not.toHaveProperty("fbc");
  });
});

describe("orderCustomData", () => {
  it("converts paise to rupees and builds contents", () => {
    const data = orderCustomData(
      [
        { id: "puja-1-Single", price: 951, quantity: 1 },
        { id: "blessing-box", price: 200 },
      ],
      115100,
    );
    expect(data.value).toBe(1151);
    expect(data.currency).toBe("INR");
    expect(data.num_items).toBe(2);
    expect(data.content_ids).toEqual(["puja-1-Single", "blessing-box"]);
    expect(data.contents[1]).toEqual({ id: "blessing-box", quantity: 1, item_price: 200 });
  });
});
