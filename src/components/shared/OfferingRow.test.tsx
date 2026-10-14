import { useState } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import OfferingRow from "./OfferingRow";

const offering = { id: "o1", name: "Lal Chunari", price: 101 };

const Row = ({ max }: { max?: number }) => {
  const [qty, setQty] = useState(0);
  return (
    <ul>
      <OfferingRow offering={offering} qty={qty} onQty={setQty} max={max} />
    </ul>
  );
};

describe("OfferingRow", () => {
  it("adds one, then steps the quantity up and down to zero", () => {
    render(<Row />);
    fireEvent.click(screen.getByRole("button", { name: /ch_add/ }));
    fireEvent.click(screen.getByRole("button", { name: "ch_qty_add" }));
    fireEvent.click(screen.getByRole("button", { name: "ch_qty_add" }));
    expect(screen.getByText("3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ch_qty_remove" }));
    fireEvent.click(screen.getByRole("button", { name: "ch_qty_remove" }));
    fireEvent.click(screen.getByRole("button", { name: "ch_qty_remove" }));
    expect(screen.getByRole("button", { name: /ch_add/ })).toBeInTheDocument();
  });

  it("stops at the limit so the order is never refused for quantity", () => {
    render(<Row max={3} />);
    fireEvent.click(screen.getByRole("button", { name: /ch_add/ }));
    const plus = screen.getByRole("button", { name: "ch_qty_add" });
    fireEvent.click(plus);
    fireEvent.click(plus);
    expect(plus).toBeDisabled();
    fireEvent.click(plus);
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
