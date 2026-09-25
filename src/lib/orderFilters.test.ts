import { describe, expect, it } from "vitest";
import { canonicalTier, type OrderItem } from "./orderItems";
import {
  ALL,
  UNRECORDED_DATE,
  buildSevaCatalog,
  buildSubFilters,
  orderMatchesSeva,
  pujaBaseName,
  shortDate,
} from "./orderFilters";

const PITRA = "PITRA SHANTI AND PITRA DOSH NIVARAN POOJA";
const SEPT_ID = "9b2efc21-adb5-4d95-a0f5-c5abba7b13a6";
const OCT_ID = "494ce3ba-975f-492e-a457-938aba3ec840";
const AMAVASYA_ID = "1111aaaa-2222-4333-8444-555566667777"; // deleted puja: no snapshot

const pitra = (pujaId: string, date: string, tier: string): OrderItem => ({
  id: `puja-${pujaId}-${tier}`,
  name: `${PITRA} (${tier})`,
  price: 951,
  quantity: 1,
  category: "puja",
  puja_id: pujaId,
  puja_name: PITRA,
  puja_date: date,
  puja_location: "Brahma Kapaal, Badrinath",
  tier,
});

const legacy = (tier: string): OrderItem => ({
  id: `puja-${AMAVASYA_ID}-${tier}`,
  name: `AMAVASYA SPECIAL: BADRI NARAYAN RAKSHA KAWACH POOJA (${tier})`,
  price: 951,
  quantity: 1,
  category: "puja",
});

const box: OrderItem = { id: "blessing-box", name: "Narayan Kripa Blessing Box", price: 200, quantity: 1, category: "addon" };
const bhoj: OrderItem = { id: "offering-x", name: "Brahman bhoj", price: 101, quantity: 1, category: "offering" };

const SEPT = "26 September 2026";
const OCT = "10 October 2026, Sarv Pitra Amavasya";

const orders = [
  { id: "o1", items: [pitra(SEPT_ID, SEPT, "Single"), box] },
  { id: "o2", items: [pitra(SEPT_ID, SEPT, "Couple")] },
  { id: "o3", items: [pitra(OCT_ID, OCT, "4 Family")] },
  { id: "o4", items: [pitra(OCT_ID, OCT, "4 Members"), bhoj] },
  // mixed order: Sept Single + Oct Couple
  { id: "o5", items: [pitra(SEPT_ID, SEPT, "Single"), pitra(OCT_ID, OCT, "Couple")] },
  { id: "o6", items: [legacy("Single")] },
  { id: "o7", items: [legacy("Couple ")] },
  { id: "o8", items: [legacy("4 Family")] },
];

describe("canonicalTier", () => {
  it("merges inconsistent package labels", () => {
    expect(canonicalTier("Couple ")).toBe("Couple");
    expect(canonicalTier("4 Family")).toBe("4 Members");
    expect(canonicalTier("4 Members")).toBe("4 Members");
    expect(canonicalTier("6 Members")).toBe("6 Members");
    expect(canonicalTier("Joint Family")).toBe("6 Members");
    expect(canonicalTier("Single")).toBe("Single");
    expect(canonicalTier("Special  Pack")).toBe("Special Pack");
    expect(canonicalTier(undefined)).toBe("");
  });
});

describe("pujaBaseName / shortDate", () => {
  it("strips the package suffix, including labels with trailing spaces", () => {
    expect(pujaBaseName(legacy("Couple "))).toBe("AMAVASYA SPECIAL: BADRI NARAYAN RAKSHA KAWACH POOJA");
    expect(pujaBaseName(pitra(SEPT_ID, SEPT, "Single"))).toBe(PITRA);
  });

  it("shortens dates and leaves other text alone", () => {
    expect(shortDate(OCT)).toBe("10 Oct 2026");
    expect(shortDate("Every Monday")).toBe("Every Monday");
  });
});

describe("buildSevaCatalog", () => {
  const catalog = buildSevaCatalog(orders);

  it("lists each puja once, whatever its dates and packages", () => {
    expect(catalog.puja.map((e) => e.label)).toEqual([PITRA, "AMAVASYA SPECIAL: BADRI NARAYAN RAKSHA KAWACH POOJA"]);
    expect(catalog.puja[0].count).toBe(5);
    expect(catalog.puja[1].count).toBe(3);
  });

  it("lists add-ons flat", () => {
    expect(catalog.addon.map((e) => e.label).sort()).toEqual(["Brahman bhoj", "Narayan Kripa Blessing Box"]);
  });
});

describe("buildSubFilters", () => {
  const pitraKey = () => buildSevaCatalog(orders).puja[0].key;

  it("splits the Pitra puja by date and merged package, in a sensible order", () => {
    const { dates, packages, dateTotal, packageTotal } = buildSubFilters(orders, { sevaKey: pitraKey(), dateKey: ALL, packageKey: ALL });
    expect(dates).toEqual([
      { key: SEPT_ID, label: "26 Sep 2026", count: 3 },
      { key: OCT_ID, label: "10 Oct 2026", count: 3 },
    ]);
    expect(packages).toEqual([
      { key: "Single", label: "Single", count: 2 },
      { key: "Couple", label: "Couple", count: 2 },
      { key: "4 Members", label: "4 Members", count: 2 },
    ]);
    expect(dateTotal).toBe(5);
    expect(packageTotal).toBe(5);
  });

  it("counts packages within the chosen date and dates within the chosen package", () => {
    const { dates, packages, dateTotal, packageTotal } = buildSubFilters(orders, { sevaKey: pitraKey(), dateKey: SEPT_ID, packageKey: "Couple" });
    // Package chips for 26 Sep: o1 + o5 Single, o2 Couple, no 4 Members (still listed, count 0).
    expect(packages).toEqual([
      { key: "Single", label: "Single", count: 2 },
      { key: "Couple", label: "Couple", count: 1 },
      { key: "4 Members", label: "4 Members", count: 0 },
    ]);
    expect(packageTotal).toBe(3);
    // Date chips for Couple: o2 on 26 Sep, o5 on 10 Oct.
    expect(dates.map((d) => d.count)).toEqual([1, 1]);
    expect(dateTotal).toBe(2);
    // A chip's count equals what selecting it shows.
    const shown = orders.filter((o) => orderMatchesSeva(o, { sevaKey: pitraKey(), dateKey: SEPT_ID, packageKey: "Couple" })).length;
    expect(shown).toBe(packages.find((p) => p.key === "Couple")!.count);
  });

  it("groups lines without a recorded date", () => {
    const key = buildSevaCatalog(orders).puja[1].key;
    const { dates, packages } = buildSubFilters(orders, { sevaKey: key, dateKey: ALL, packageKey: ALL });
    expect(dates).toEqual([{ key: UNRECORDED_DATE, label: "Not recorded", count: 3 }]);
    expect(packages.map((p) => p.key)).toEqual(["Single", "Couple", "4 Members"]);
  });

  it("returns nothing when no seva is selected", () => {
    expect(buildSubFilters(orders, { sevaKey: ALL, dateKey: ALL, packageKey: ALL })).toEqual({
      dates: [], packages: [], dateTotal: 0, packageTotal: 0,
    });
  });
});

describe("orderMatchesSeva", () => {
  const key = buildSevaCatalog(orders).puja[0].key;
  const match = (dateKey: string, packageKey: string) =>
    orders.filter((o) => orderMatchesSeva(o, { sevaKey: key, dateKey, packageKey })).map((o) => o.id);

  it("requires the date and package to be on the same line", () => {
    // o5 has a Sept Single and an Oct Couple line: it must not match Sept + Couple.
    expect(match(SEPT_ID, "Couple")).toEqual(["o2"]);
    expect(match(OCT_ID, "Couple")).toEqual(["o5"]);
  });

  it("treats 4 Family and 4 Members as one package", () => {
    expect(match(ALL, "4 Members")).toEqual(["o3", "o4"]);
  });

  it("matches everything when no seva is chosen", () => {
    expect(orders.every((o) => orderMatchesSeva(o, { sevaKey: ALL, dateKey: ALL, packageKey: ALL }))).toBe(true);
  });
});
