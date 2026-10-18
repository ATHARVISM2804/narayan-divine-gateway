import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const upload = vi.fn();
vi.mock("@/lib/supabase", () => ({
  SUPABASE_URL: "https://x.supabase.co",
  SUPABASE_DIRECT_URL: "https://x.supabase.co",
  supabase: {
    storage: {
      from: () => ({
        upload: (...args: unknown[]) => upload(...args),
        getPublicUrl: (name: string) => ({ data: { publicUrl: `https://x.supabase.co/p/${name}` } }),
      }),
    },
  },
}));

import ImageUpload from "./ImageUpload";

const pick = (container: HTMLElement, w: number, h: number) => {
  vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width: w, height: h, close: () => {} })));
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(["x"], "p.png", { type: "image/png" })] } });
};

describe("ImageUpload poster check", () => {
  beforeEach(() => {
    upload.mockReset();
    upload.mockResolvedValue({ error: null });
  });

  it("refuses a poster that is not the 1483 x 1061 shape and uploads nothing", async () => {
    const onChange = vi.fn();
    const { container } = render(<ImageUpload poster value={null} onChange={onChange} />);
    expect(screen.getByText(/Use 1483 × 1061 px/)).toBeTruthy();

    pick(container, 1000, 1000);

    await screen.findByText("This image is 1000 × 1000 px. Please upload 1483 × 1061 px so it shows fully on the site.");
    expect(upload).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("uploads a poster of the right shape", async () => {
    const onChange = vi.fn();
    const { container } = render(<ImageUpload poster value={null} onChange={onChange} />);

    pick(container, 2966, 2122);

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(upload).toHaveBeenCalledTimes(1);
  });

  it("does not check the shape of other images", async () => {
    const onChange = vi.fn();
    const { container } = render(<ImageUpload value={null} onChange={onChange} />);

    pick(container, 1000, 1000);

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
  });
});
