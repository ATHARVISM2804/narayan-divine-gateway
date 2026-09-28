import { describe, expect, it } from "vitest";
import { allowedWidth, imageSrcSet, isStorageImage, optimizedImage } from "./imageUrl";

const UPLOAD = "https://opztoxuohtizymhwofas.supabase.co/storage/v1/object/public/product-images/1789667923952-xcpydw4bl4h.png";

describe("optimizedImage", () => {
  it("serves uploaded images through Vercel, resized", () => {
    expect(optimizedImage(UPLOAD, 400, true)).toBe(`/_vercel/image?url=${encodeURIComponent(UPLOAD)}&w=640&q=75`);
  });

  it("only uses widths vercel.json allows", () => {
    expect(allowedWidth(1)).toBe(64);
    expect(allowedWidth(128)).toBe(128);
    expect(allowedWidth(129)).toBe(256);
    expect(allowedWidth(5000)).toBe(1200);
  });

  it("leaves bundled, external and missing images alone", () => {
    expect(optimizedImage("/assets/hero-temple-Bvoh1h1j.jpg", 400, true)).toBe("/assets/hero-temple-Bvoh1h1j.jpg");
    expect(optimizedImage("https://res.cloudinary.com/x/logo.png", 400, true)).toBe("https://res.cloudinary.com/x/logo.png");
    expect(isStorageImage("")).toBe(false);
    expect(isStorageImage(undefined)).toBe(false);
  });

  it("is off outside Vercel (dev server, tests)", () => {
    expect(optimizedImage(UPLOAD, 400)).toBe(UPLOAD);
    expect(imageSrcSet(UPLOAD, 400)).toBeUndefined();
  });
});

describe("imageSrcSet", () => {
  it("offers 1x–3x sizes without duplicates", () => {
    const set = imageSrcSet(UPLOAD, 400, true)!;
    expect(set.split(", ").map((s) => s.split(" ")[1])).toEqual(["640w", "828w", "1200w"]);
    expect(imageSrcSet(UPLOAD, 64, true)!.split(", ").map((s) => s.split(" ")[1])).toEqual(["64w", "128w", "256w"]);
  });
});
