import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import OfferingsSheet from "./OfferingsSheet";
import type { ChadhavaOffering } from "@/lib/supabase";

const offering = (id: string, name: string, price: number) =>
  ({ id, name, price, chadhava_id: "c", name_hi: null, description: null, description_hi: null, image_url: null }) as unknown as ChadhavaOffering;
const offerings = [offering("a", "Chunari", 251), offering("b", "Bhog", 501)];

const Page = ({ onContinue = () => {} }: { onContinue?: (sel: Record<string, number>) => void }) => {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const setQty = (id: string, q: number) =>
    setSelected((p) => {
      const c = { ...p };
      if (q <= 0) delete c[id];
      else c[id] = q;
      return c;
    });
  return (
    <OfferingsSheet
      name="Maa Vaishno Devi"
      offerings={offerings}
      selected={selected}
      onQty={setQty}
      includes={["Video of your offering"]}
      onContinue={() => onContinue(selected)}
      onClose={() => {}}
    />
  );
};

describe("OfferingsSheet", () => {
  it("keeps Continue off until something is picked", () => {
    render(<Page />);
    expect(screen.getByRole("button", { name: /ch_proceed/ })).toBeDisabled();
  });

  it("adds, steps quantities and totals them", () => {
    const onContinue = vi.fn();
    render(<Page onContinue={onContinue} />);
    const [addChunari, addBhog] = screen.getAllByRole("button", { name: /ch_add/ });
    fireEvent.click(addChunari);
    fireEvent.click(addBhog);
    fireEvent.click(screen.getAllByRole("button", { name: "ch_qty_add" })[0]);
    // 2 × 251 + 1 × 501
    expect(screen.getByText("₹1,003")).toBeInTheDocument();
    expect(screen.getByText(/^3 ch_items_selected$/)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "ch_qty_remove" })[1]);
    expect(screen.getByText("₹502")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /ch_proceed/ }));
    expect(onContinue).toHaveBeenCalledWith({ a: 2 });
  });
});
