import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const invoke = vi.fn();
vi.mock("@/lib/supabase", () => ({
  supabase: { functions: { invoke: (...a: unknown[]) => invoke(...a) }, from: () => ({ insert: vi.fn() }) },
}));
vi.mock("@/lib/metaPixel", () => ({
  getMetaTrackingContext: () => ({}),
  newMetaEventId: () => "lead-1",
  trackLead: vi.fn(),
}));

import PackageSheet, { type BookingStep } from "./PackageSheet";
import type { Tier } from "./BookingPanel";
import { tierImage, tierMembers, tierTone } from "@/lib/packages";

const tiers: Tier[] = [
  { label: "Single", price: 951 },
  { label: "Couple", price: 1551 },
  { label: "Family (4)", price: 2151 },
];

/** Like PujaDetail: the page owns the choice and the step, and opens with the first package. */
const Page = ({
  start = "package",
  onConfirm = () => {},
  onAddToCart = () => {},
}: {
  start?: BookingStep;
  onConfirm?: (tier: Tier | null, name: string, phone: string) => void;
  onAddToCart?: () => void;
}) => {
  const [selected, setSelected] = useState<Tier | null>(tiers[0]);
  const [step, setStep] = useState<BookingStep | null>(start);
  return step ? (
    <PackageSheet
      name="Maa Baglamukhi Hawan"
      pujaName="Maa Baglamukhi Hawan"
      tiers={tiers}
      selected={selected}
      onSelect={setSelected}
      includes={["Video on WhatsApp"]}
      step={step}
      onStep={setStep}
      onConfirm={(name, phone) => { onConfirm(selected, name, phone); setStep(null); }}
      onAddToCart={() => { onAddToCart(); setStep(null); }}
      onClose={() => setStep(null)}
    />
  ) : null;
};

describe("PackageSheet", () => {
  beforeEach(() => {
    invoke.mockReset().mockResolvedValue({ error: null });
    localStorage.clear();
  });

  it("opens with what every package includes and the first package chosen", () => {
    render(<Page />);
    expect(screen.getByText("Video on WhatsApp")).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(radios[1]).toHaveAttribute("aria-checked", "false");
  });

  it("shows each package's photo, member pill and price", () => {
    render(<Page />);
    const couple = screen.getByRole("radio", { name: /Couple/ });
    expect(couple).toHaveTextContent("2 pkg_person");
    expect(couple).toHaveTextContent("₹1,551");
    expect(couple.querySelector("img")).not.toBeNull();
  });

  it("Proceed shows the details step for the picked package, and ← keeps the choice", () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("radio", { name: /Couple/ }));
    expect(screen.getByRole("button", { name: /btn_proceed/ })).toHaveTextContent("₹1,551");
    fireEvent.click(screen.getByRole("button", { name: /btn_proceed/ }));
    expect(screen.getByText("lead_details_title")).toBeInTheDocument();
    expect(screen.queryByRole("radio")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "lead_back" }));
    expect(screen.getByRole("radio", { name: /Couple/ })).toHaveAttribute("aria-checked", "true");
  });

  it("keeps Next disabled until a 10-digit number and a name are filled", () => {
    render(<Page start="details" />);
    const next = screen.getByRole("button", { name: /lead_next/ });
    expect(next).toBeDisabled();
    fireEvent.change(screen.getByLabelText("lead_phone_title"), { target: { value: "98765" } });
    fireEvent.change(screen.getByLabelText("lead_name_title"), { target: { value: "Asha" } });
    expect(next).toBeDisabled();
    fireEvent.change(screen.getByLabelText("lead_phone_title"), { target: { value: "9876543210" } });
    expect(next).toBeEnabled();
    expect(invoke).not.toHaveBeenCalled();
  });

  it("saves the lead and continues with the chosen package", async () => {
    const onConfirm = vi.fn();
    render(<Page start="details" onConfirm={onConfirm} />);
    fireEvent.change(screen.getByLabelText("lead_phone_title"), { target: { value: "98765 43210" } });
    fireEvent.change(screen.getByLabelText("lead_name_title"), { target: { value: "Asha" } });
    fireEvent.click(screen.getByRole("button", { name: /lead_next/ }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(tiers[0], "Asha", "9876543210"));
    expect(invoke).toHaveBeenCalledWith("submit-lead", expect.objectContaining({
      body: expect.objectContaining({ package_label: "Single", price: 951, phone: "9876543210" }),
    }));
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

  it("gives each package size its own photo and colour", () => {
    expect(tierImage("Single")).not.toBe(tierImage("Couple"));
    expect(tierImage("4 Members")).not.toBe(tierImage("6 Members"));
    expect(tierTone("Couple").price).toContain("rose");
    expect(tierTone("4 Members").price).toContain("emerald");
    expect(tierTone("Special").price).toContain("saffron");
  });
});
