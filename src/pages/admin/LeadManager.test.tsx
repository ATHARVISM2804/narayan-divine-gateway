import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

// 120 leads, newest first; lead 0 and lead 1 share a number.
const LEADS = Array.from({ length: 120 }, (_, i) => ({
  id: `lead-${i}`,
  name: `Devotee ${i}`,
  phone: i === 1 ? "+91 90000 00000" : `9${String(i).padStart(9, "0")}`,
  puja_name: "Rudrabhishek",
  package_label: null,
  price: 1100,
  source: "puja_page",
  created_at: new Date(Date.UTC(2026, 9, 14, 12) - i * 3_600_000).toISOString(),
  contacted_at: null,
}));

const rpc = vi.fn(async () => ({ data: "2026-10-14T12:30:00.000Z", error: null }));
vi.mock("@/lib/supabase", () => {
  const query = {
    select: () => query,
    order: () => query,
    range: (from: number, to: number) => Promise.resolve({ data: LEADS.slice(from, to + 1), error: null }),
  };
  return { supabase: { from: () => query, rpc: (...a: unknown[]) => rpc(...(a as [])) } };
});
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { default: LeadManager } = await import("./LeadManager");

afterEach(cleanup);

// getAllByRole is very slow on 100 cards in jsdom.
const switches = () => [...document.querySelectorAll<HTMLButtonElement>('[role="switch"]')];

describe("LeadManager", () => {
  it("draws 50 leads, then 50 more on Show more", async () => {
    render(<LeadManager />);
    expect(await screen.findByText("Devotee 0")).toBeTruthy();
    expect(switches()).toHaveLength(50);
    expect(screen.queryByText("Devotee 50")).toBeNull();

    fireEvent.click(screen.getByText("Show more (70 more)"));
    expect(switches()).toHaveLength(100);
    expect(screen.getByText("Devotee 99")).toBeTruthy();
  });

  it("searches all leads, not only the drawn ones", async () => {
    render(<LeadManager />);
    await screen.findByText("Devotee 0");
    fireEvent.change(screen.getByPlaceholderText(/Search by name/), { target: { value: "devotee 117" } });
    expect(await screen.findByText("Devotee 117")).toBeTruthy();
    expect(switches()).toHaveLength(1);
  });

  it("marks every lead of the number contacted with one tap", async () => {
    render(<LeadManager />);
    await screen.findByText("Devotee 0");
    await act(async () => { fireEvent.click(switches()[0]); });
    expect(rpc).toHaveBeenCalledWith("set_contacted", { p_phone: LEADS[0].phone, p_contacted: true });
    const on = switches().filter((s) => s.getAttribute("aria-checked") === "true");
    expect(on).toHaveLength(2);
  });
});
