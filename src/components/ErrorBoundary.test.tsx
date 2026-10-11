import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

const Boom = (): never => {
  throw new Error("render failed");
};

describe("ErrorBoundary", () => {
  it("clears the error when resetKey changes, so the next page renders", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(
      <ErrorBoundary resetKey="/about">
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.queryByText("next page")).toBeNull();
    expect(screen.getByRole("button")).toBeTruthy();

    rerender(
      <ErrorBoundary resetKey="/contact">
        <p>next page</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("next page")).toBeTruthy();
  });
});
