import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import PackageSheet from "./PackageSheet";
import type { Tier } from "./BookingPanel";
import { tierMembers } from "@/lib/packages";

const tiers: Tier[] = [
  { label: "Single", price: 951 },
  { label: "Couple", price: 1551 },
  { label: "Family (4)", price: 2151 },
];

/** Like PujaDetail: the page owns the choice and opens the sheet with the first package. */
const Page = ({ onContinue = () => {}, onAddToCart = () => {} }: { onContinue?: (t: Tier | null) => void; onAddToCart?: () => void }) => {
  const [selected, setSelected] = useState<Tier | null>(tiers[0]);
  const [open, setOpen] = useState(true);
  return open ? (
    <PackageSheet
      name="Maa Baglamukhi Hawan"
      tiers={tiers}
      tierImage={() => "x.webp"}
      selected={selected}
      onSelect={setSelected}
      includes={["Video on WhatsApp"]}
      onContinue={() => { onContinue(selected); setOpen(false); }}
      onAddToCart={() => { onAddToCart(); setOpen(false); }}
      onClose={() => setOpen(false)}
    />
  ) : null;
};

describe("PackageSheet", () => {
  it("opens with the first package chosen and every package as a radio", () => {
    render(<Page />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(radios[1]).toHaveAttribute("aria-checked", "false");
  });

  it("continues with the package the devotee picked", () => {
    const onContinue = vi.fn();
    render(<Page onContinue={onContinue} />);
    fireEvent.click(screen.getByRole("radio", { name: /Couple/ }));
    expect(screen.getByRole("radio", { name: /Couple/ })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("button", { name: /btn_continue/ }));
    expect(onContinue).toHaveBeenCalledWith(tiers[1]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("adds to cart and closes", () => {
    const onAddToCart = vi.fn();
    render(<Page onAddToCart={onAddToCart} />);
    fireEvent.click(screen.getByRole("button", { name: "btn_add_cart" }));
    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("tierMembers", () => {
  it("reads the member count from package labels", () => {
    expect(tierMembers("Family (4)")).toBe(4);
    expect(tierMembers("Couple")).toBe(2);
    expect(tierMembers("Single")).toBe(1);
    expect(tierMembers("Joint family")).toBe(6);
    expect(tierMembers("Special")).toBeNull();
  });
});
