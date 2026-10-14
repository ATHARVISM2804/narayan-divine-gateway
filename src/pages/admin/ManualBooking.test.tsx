import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { Chadhava, Puja } from "@/lib/supabase";

const PUJA_ID = "11111111-2222-3333-4444-555555555555";
const ADDON_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

const invoke = vi.fn(async () => ({ data: { db_order_id: "99999999-8888-7777-6666-555555555555", status: "paid", amount: 130200 }, error: null }));
const rows: Record<string, unknown[]> = {
  puja_offerings: [{ id: ADDON_ID, name: "Deep Daan", price: 51 }],
  chadhava_offerings: [],
  orders: [],
};
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table: string) => {
      const q = {
        select: () => q, eq: () => q, order: () => q, limit: () => q,
        maybeSingle: async () => ({ data: null }),
        then: (r: (v: unknown) => void) => r({ data: rows[table] ?? [] }),
      };
      return q;
    },
    functions: { invoke: (...a: unknown[]) => invoke(...(a as [])) },
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const { default: ManualBooking } = await import("./ManualBooking");

const pujas = [{
  id: PUJA_ID, name: "Rudrabhishek", date: "21 December 2099", location: "Kashi", status: "active",
  prices: [{ label: "Single", price: 851 }, { label: "Couple", price: 1251 }],
}] as unknown as Puja[];

afterEach(cleanup);

describe("ManualBooking", () => {
  it("books a couple pooja with an add-on as already paid by UPI", async () => {
    render(<ManualBooking pujas={pujas} chadhavas={[] as Chadhava[]} onViewOrders={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText("10-digit mobile"), { target: { value: "+91 98765 43210" } });
    fireEvent.change(screen.getByPlaceholderText("Customer's name"), { target: { value: "Ram Kumar" } });
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: PUJA_ID } });
    fireEvent.click(screen.getByText("Couple · ₹1,251"));
    fireEvent.click(await screen.findByText("Deep Daan · ₹51"));
    fireEvent.change(screen.getByPlaceholderText("Name (optional)"), { target: { value: "Sita Devi" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. Kashyap"), { target: { value: "Bharadwaj" } });

    // UPI needs a UTR before it can be saved.
    expect(screen.getByText("Enter the UPI / bank reference (UTR).")).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/UTR \/ reference/), { target: { value: "UTR42" } });
    expect(screen.getByRole("button", { name: /Save paid booking · ₹1,302/ })).toBeTruthy();

    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Save paid booking/ })); });

    expect(invoke).toHaveBeenCalledTimes(1);
    const [fn, { body }] = invoke.mock.calls[0] as unknown as [string, { body: Record<string, any> }];
    expect(fn).toBe("admin-create-order");
    expect(body.items.map((i: { id: string }) => i.id)).toEqual([`puja-${PUJA_ID}-Couple`, `offering-${ADDON_ID}`]);
    expect(body.customer).toMatchObject({ name: "Ram Kumar", phone: "9876543210" });
    expect(body.puja_details).toEqual({ member_names: ["Ram Kumar", "Sita Devi"], gotra: "Bharadwaj" });
    expect(body.payment).toMatchObject({ mode: "paid", method: "upi", reference: "UTR42" });
    expect(body.amount_override).toBeUndefined();

    expect(await screen.findByText("Booking saved as PAID")).toBeTruthy();
    expect(screen.getByText(/Send confirmation on WhatsApp/)).toBeTruthy();
  });
});
