import { describe, expect, it } from "vitest";
import { supabaseClientUrl } from "./supabaseUrl";

const DIRECT = "https://opztoxuohtizymhwofas.supabase.co";

describe("supabaseClientUrl", () => {
  it("goes through our own domain on the live site", () => {
    expect(supabaseClientUrl(DIRECT, { hostname: "www.narayankripa.in", origin: "https://www.narayankripa.in" }))
      .toBe("https://www.narayankripa.in/sb");
    expect(supabaseClientUrl(DIRECT, { hostname: "narayankripa.in", origin: "https://narayankripa.in" }))
      .toBe("https://narayankripa.in/sb");
  });

  it("talks to Supabase directly everywhere else", () => {
    expect(supabaseClientUrl(DIRECT, { hostname: "localhost", origin: "http://localhost:8080" })).toBe(DIRECT);
    expect(supabaseClientUrl(DIRECT, { hostname: "nk-git-x.vercel.app", origin: "https://nk-git-x.vercel.app" })).toBe(DIRECT);
    expect(supabaseClientUrl(DIRECT, { hostname: "narayankripa.in.evil.com", origin: "https://narayankripa.in.evil.com" })).toBe(DIRECT);
    expect(supabaseClientUrl(DIRECT)).toBe(DIRECT);
  });
});
