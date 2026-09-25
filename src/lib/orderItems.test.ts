import { describe, expect, it } from "vitest";
import {
  formatOrderItemLine,
  orderItemChadhavaId,
  orderItemFilterLabel,
  orderItemKey,
  orderItemPujaId,
  orderItemTier,
  orderItemWhen,
  type OrderItem,
} from "./orderItems";

const SEPT: OrderItem = {
  id: "puja-9b2efc21-adb5-4d95-a0f5-c5abba7b13a6-Single",
  name: "PITRA SHANTI AND PITRA DOSH NIVARAN POOJA (Single)",
  price: 951,
  quantity: 1,
  category: "puja",
  puja_id: "9b2efc21-adb5-4d95-a0f5-c5abba7b13a6",
  puja_name: "PITRA SHANTI AND PITRA DOSH NIVARAN POOJA",
  puja_date: "26 September 2026",
  puja_location: "BRAHMA KAPAAL, BADRINATH",
  tier: "Single",
};

// Older orders: only the composite id and the name were saved.
const LEGACY: OrderItem = {
  id: "puja-494CE3BA-975f-492e-a457-938aba3ec840-Family Pack",
  name: "PITRA SHANTI AND PITRA DOSH NIVARAN POOJA (Family Pack)",
  price: 2100,
  quantity: 1,
  category: "puja",
};

const CHADHAVA: OrderItem = {
  id: "chadhava-1c8a2f36-2b7a-4a0f-9a0a-3c5c5a8b1e2d",
  name: "Bel Patra",
  price: 251,
  quantity: 2,
  category: "chadhava",
  chadhava_id: "1c8a2f36-2b7a-4a0f-9a0a-3c5c5a8b1e2d",
  chadhava_temple: "Kashi Vishwanath",
  chadhava_date: "3 October 2026",
};

describe("orderItems", () => {
  it("reads the puja id and tier from the snapshot", () => {
    expect(orderItemPujaId(SEPT)).toBe("9b2efc21-adb5-4d95-a0f5-c5abba7b13a6");
    expect(orderItemTier(SEPT)).toBe("Single");
  });

  it("falls back to the composite id for legacy lines, normalising case and keeping tier labels with spaces", () => {
    expect(orderItemPujaId(LEGACY)).toBe("494ce3ba-975f-492e-a457-938aba3ec840");
    expect(orderItemTier(LEGACY)).toBe("Family Pack");
    expect(orderItemWhen(LEGACY)).toBeNull();
  });

  it("gives same-name pujas different keys and labels", () => {
    expect(orderItemKey(SEPT)).not.toBe(orderItemKey(LEGACY));
    expect(orderItemFilterLabel(SEPT)).toBe("PITRA SHANTI AND PITRA DOSH NIVARAN POOJA — 26 September 2026");
    expect(orderItemFilterLabel(LEGACY)).toBe("PITRA SHANTI AND PITRA DOSH NIVARAN POOJA (Family Pack)");
  });

  it("describes when and where", () => {
    expect(orderItemWhen(SEPT)).toBe("26 September 2026 • BRAHMA KAPAAL, BADRINATH");
    expect(orderItemWhen(CHADHAVA)).toBe("3 October 2026 • Kashi Vishwanath");
    expect(orderItemChadhavaId(CHADHAVA)).toBe("1c8a2f36-2b7a-4a0f-9a0a-3c5c5a8b1e2d");
  });

  it("formats message lines with the date when known", () => {
    expect(formatOrderItemLine(SEPT)).toBe(
      "PITRA SHANTI AND PITRA DOSH NIVARAN POOJA (Single) — 26 September 2026 • BRAHMA KAPAAL, BADRINATH",
    );
    expect(formatOrderItemLine(LEGACY)).toBe("PITRA SHANTI AND PITRA DOSH NIVARAN POOJA (Family Pack)");
  });

  it("keys add-ons by name", () => {
    expect(orderItemKey({ id: "blessing-box", name: "Narayan Kripa Blessing Box", price: 200 })).toBe("name:Narayan Kripa Blessing Box");
  });
});
