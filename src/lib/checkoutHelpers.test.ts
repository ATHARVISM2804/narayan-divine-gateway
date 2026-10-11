import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({ supabase: {} }));

import { isInAppBrowser, isIOS } from "./browserEnv";
import { normaliseIndianMobile, isValidIndianMobile } from "./phone";
import { claimConfirmation, clearPendingPayment, loadPendingPayment, PENDING_MAX_AGE_MS, savePendingPayment } from "./pendingPayment";
import { diffCart } from "./cartRefresh";
import type { CartItem } from "@/context/CartContext";

const UA = {
  facebookAndroid: "Mozilla/5.0 (Linux; Android 13; SM-A146B Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.6668.81 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/484.0.0.43.109;]",
  instagramIOS: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.21.106 (iPhone14,5; iOS 17_6; en_IN)",
  whatsapp: "Mozilla/5.0 (Linux; Android 12; RMX3363) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36 WhatsApp/2.24.1",
  chromeAndroid: "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
  safariIOS: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
  desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
};

describe("isInAppBrowser", () => {
  it("detects Facebook, Instagram and WhatsApp in-app browsers", () => {
    expect(isInAppBrowser(UA.facebookAndroid)).toBe(true);
    expect(isInAppBrowser(UA.instagramIOS)).toBe(true);
    expect(isInAppBrowser(UA.whatsapp)).toBe(true);
  });

  it("leaves real browsers alone", () => {
    expect(isInAppBrowser(UA.chromeAndroid)).toBe(false);
    expect(isInAppBrowser(UA.safariIOS)).toBe(false);
    expect(isInAppBrowser(UA.desktop)).toBe(false);
  });

  it("tells iOS apart for the right 'open in browser' hint", () => {
    expect(isIOS(UA.instagramIOS)).toBe(true);
    expect(isIOS(UA.facebookAndroid)).toBe(false);
  });
});

describe("normaliseIndianMobile", () => {
  it.each([
    ["9876543210", "9876543210"],
    ["+91 98765 43210", "9876543210"],
    ["919876543210", "9876543210"],
    ["09876543210", "9876543210"],
    ["98765-43210", "9876543210"],
  ])("%s → %s", (raw, out) => expect(normaliseIndianMobile(raw)).toBe(out));

  it("rejects numbers that aren't Indian mobiles", () => {
    expect(normaliseIndianMobile("1234567890")).toBeNull();
    expect(normaliseIndianMobile("98765")).toBeNull();
    expect(normaliseIndianMobile(undefined)).toBeNull();
    expect(isValidIndianMobile("5876543210")).toBe(false);
    expect(isValidIndianMobile("6876543210")).toBe(true);
  });
});

describe("pending payment", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  const pending = (createdAt = Date.now(), dbOrderId = "order-1") => ({ dbOrderId, value: 1551, items: [], createdAt });

  it("is remembered while recent and forgotten once stale", () => {
    savePendingPayment(pending());
    expect(loadPendingPayment()?.dbOrderId).toBe("order-1");
    expect(loadPendingPayment(Date.now() + PENDING_MAX_AGE_MS + 1)).toBeNull();
    expect(localStorage.getItem("nk_pending_payment")).toBeNull();
  });

  it("clearing for another order leaves the current one", () => {
    savePendingPayment(pending(Date.now(), "order-2"));
    clearPendingPayment("order-1");
    expect(loadPendingPayment()?.dbOrderId).toBe("order-2");
  });

  it("a paid order is claimed only once (one Purchase, one cart clear)", () => {
    savePendingPayment(pending(Date.now(), "order-3"));
    expect(claimConfirmation("order-3")).toBe(true);
    expect(claimConfirmation("order-3")).toBe(false);
    expect(loadPendingPayment()).toBeNull();
  });
});

describe("diffCart", () => {
  const PUJA_ID = "11111111-2222-3333-4444-555555555555";
  const OFF_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
  const item = (id: string, category: CartItem["category"], price: number): CartItem => ({ id, name: id, description: "", price, category, quantity: 1 });

  it("drops lines that are gone and reprices changed ones", () => {
    const items = [
      item(`puja-${PUJA_ID}-Couple`, "puja", 1551),
      item(`puja-${PUJA_ID}-Family`, "puja", 2100),
      item(`chadhava-${OFF_ID}`, "chadhava", 251),
      item("chadhava-ffffffff-bbbb-cccc-dddd-eeeeeeeeeeee", "chadhava", 101),
    ];
    const changes = diffCart(
      items,
      [{ id: PUJA_ID, prices: [{ label: "Couple", price: 1551 }, { label: "Family (4)", price: 2100 }] }],
      [{ id: OFF_ID, price: 301 }],
    );
    expect(changes.remove).toEqual([`puja-${PUJA_ID}-Family`, "chadhava-ffffffff-bbbb-cccc-dddd-eeeeeeeeeeee"]);
    expect(changes.reprice).toEqual([{ id: `chadhava-${OFF_ID}`, price: 301 }]);
  });

  it("leaves an up-to-date cart untouched", () => {
    const changes = diffCart([item(`puja-${PUJA_ID}-Couple`, "puja", 1551)], [{ id: PUJA_ID, prices: [{ label: "Couple", price: 1551 }] }], []);
    expect(changes).toEqual({ remove: [], reprice: [] });
  });
});
