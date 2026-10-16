import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import StickyActionBar from "./StickyActionBar";

describe("StickyActionBar", () => {
  it("without a title is one full-width button (no price, no Continue)", () => {
    const onClick = vi.fn();
    render(<StickyActionBar cta="Select pooja package" onClick={onClick} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent("Select pooja package");
    expect(buttons[0].className).toContain("w-full");
    fireEvent.click(buttons[0]);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("when hidden, slides away and leaves the tab order", () => {
    const { container } = render(<StickyActionBar cta="Select pooja package" onClick={() => {}} hidden />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar).toHaveAttribute("aria-hidden", "true");
    expect(bar).toHaveAttribute("inert");
    expect(bar.className).toContain("translate-y-full");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("with a title keeps the price side next to the button", () => {
    render(<StickyActionBar title="₹951" subtitle="Single" cta="Continue" onClick={() => {}} />);
    expect(screen.getByText("₹951")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });
});
