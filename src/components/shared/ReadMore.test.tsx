import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ReadMore from "./ReadMore";

vi.mock("@/context/LanguageContext", () => ({
  useLanguage: () => ({ t: (k: string) => ({ btn_read_more: "Read more", btn_read_less: "Read less" })[k] ?? k, lang: "en" }),
}));

describe("ReadMore", () => {
  it("shows short text in full with no button", () => {
    render(<ReadMore length={120}><p>Short story</p></ReadMore>);
    expect(screen.getByText("Short story")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("starts long text collapsed and toggles it open and closed", () => {
    render(<ReadMore length={2000} collapsedClass="max-h-[18rem]"><p>Long story</p></ReadMore>);
    const button = screen.getByRole("button", { name: /Read more/ });
    const clip = screen.getByText("Long story").parentElement!;
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(clip.className).toContain("max-h-[18rem]");

    fireEvent.click(button);
    expect(screen.getByRole("button", { name: /Read less/ }).getAttribute("aria-expanded")).toBe("true");
    expect(clip.className).not.toContain("max-h-[18rem]");

    fireEvent.click(screen.getByRole("button", { name: /Read less/ }));
    expect(clip.className).toContain("max-h-[18rem]");
  });
});
