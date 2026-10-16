import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FeatureChips from "./FeatureChips";

// The default language context returns the key, so these check which copy each page gets.
describe("FeatureChips", () => {
  it("pooja pages promise the pooja video and the rituals", () => {
    render(<FeatureChips kind="puja" />);
    expect(screen.getByText("feat_video_t")).toBeInTheDocument();
    expect(screen.getByText("feat_rituals_t")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("chadhava pages talk about the offering video", () => {
    render(<FeatureChips kind="chadhava" />);
    expect(screen.getByText("feat_video_ch_t")).toBeInTheDocument();
    expect(screen.queryByText("feat_video_t")).toBeNull();
  });
});
