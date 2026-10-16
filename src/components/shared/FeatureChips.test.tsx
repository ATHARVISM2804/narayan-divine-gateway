import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FeatureChips from "./FeatureChips";

// The default language context returns the key, so these check which copy each page gets.
describe("FeatureChips", () => {
  it("pooja pages show the four promises: video, rituals, mantra, prasad box", () => {
    render(<FeatureChips kind="puja" />);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    for (const key of ["feat_video_t", "feat_rituals_t", "feat_mantra_t", "feat_box_t"]) {
      expect(screen.getByText(key)).toBeInTheDocument();
    }
  });

  it("chadhava pages talk about the offering video", () => {
    render(<FeatureChips kind="chadhava" />);
    expect(screen.getByText("feat_video_ch_t")).toBeInTheDocument();
    expect(screen.queryByText("feat_video_t")).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });
});
