import { afterEach, describe, expect, it, vi } from "vitest";
import { loadRazorpayScript, RAZORPAY_SRC } from "./razorpayScript";

const win = window as unknown as { Razorpay?: unknown };

const scripts = () => Array.from(document.querySelectorAll<HTMLScriptElement>(`script[src="${RAZORPAY_SRC}"]`));

/** jsdom never fetches scripts: settle the newest one by hand. */
async function settleLatest(outcome: "load" | "error", defineRazorpay = outcome === "load") {
  await vi.waitFor(() => expect(scripts().length).toBe(1));
  const s = scripts()[0];
  if (defineRazorpay) win.Razorpay = function Razorpay() {};
  s.dispatchEvent(new Event(outcome));
}

afterEach(() => {
  delete win.Razorpay;
  scripts().forEach((s) => s.remove());
  vi.useRealTimers();
});

describe("loadRazorpayScript", () => {
  it("retries after a failed load instead of trusting the leftover <script> tag", async () => {
    const p = loadRazorpayScript({ attempts: 2, timeoutMs: 5000 });
    await settleLatest("error");
    await settleLatest("load");
    await expect(p).resolves.toBeUndefined();
    expect(scripts().length).toBe(1);
  });

  it("rejects (so the customer sees an error and the WhatsApp fallback) after every attempt fails", async () => {
    const p = loadRazorpayScript({ attempts: 2, timeoutMs: 5000 });
    await settleLatest("error");
    await settleLatest("error");
    await expect(p).rejects.toThrow(/failed to load/i);
    expect(scripts().length).toBe(0);
  });

  it("does not resolve on load if window.Razorpay never appeared", async () => {
    const p = loadRazorpayScript({ attempts: 1, timeoutMs: 5000 });
    await settleLatest("load", false);
    await expect(p).rejects.toThrow();
  });

  it("times out a stalled load", async () => {
    vi.useFakeTimers();
    const p = loadRazorpayScript({ attempts: 1, timeoutMs: 1000 });
    const assertion = expect(p).rejects.toThrow(/too long/i);
    await vi.advanceTimersByTimeAsync(1001);
    await assertion;
  });

  it("resolves at once when already loaded", async () => {
    win.Razorpay = function Razorpay() {};
    await expect(loadRazorpayScript()).resolves.toBeUndefined();
    expect(scripts().length).toBe(0);
  });
});
