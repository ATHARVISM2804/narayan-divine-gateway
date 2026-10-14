import { useEffect, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import BottomSheet from "./BottomSheet";

afterEach(() => vi.useRealTimers());

/** Like PujaDetail: a countdown re-renders the page every second, and onClose is
    a new inline function on every render. */
const TickingPage = ({ onClose = () => {} }: { onClose?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      <button onClick={() => setOpen(true)}>Continue</button>
      <BottomSheet open={open} onClose={() => { onClose(); setOpen(false); }} title="Details">
        <input aria-label="phone" />
      </BottomSheet>
    </>
  );
};

describe("BottomSheet", () => {
  it("keeps the keyboard up: a page re-render does not pull focus out of the field", () => {
    vi.useFakeTimers();
    render(<TickingPage />);
    fireEvent.click(screen.getByText("Continue"));
    const input = screen.getByLabelText("phone");
    input.focus();
    expect(document.activeElement).toBe(input);

    act(() => vi.advanceTimersByTime(3000));

    expect(document.activeElement).toBe(input);
  });

  it("moves focus into the sheet on open and back to the opener on close", () => {
    render(<TickingPage />);
    const opener = screen.getByText("Continue");
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("Escape and the close button call the latest onClose after re-renders", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<TickingPage onClose={onClose} />);
    fireEvent.click(screen.getByText("Continue"));
    act(() => vi.advanceTimersByTime(2000));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Continue"));
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("locks page scroll while open and restores it on close", () => {
    vi.useFakeTimers();
    document.body.style.overflow = "auto";
    render(<TickingPage />);
    fireEvent.click(screen.getByText("Continue"));
    expect(document.body.style.overflow).toBe("hidden");
    act(() => vi.advanceTimersByTime(2000));
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.body.style.overflow).toBe("auto");
  });
});
