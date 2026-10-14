import { describe, expect, it } from "vitest";
import { MAX_QTY } from "./orderLimits";
import { MAX_QTY as SERVER_MAX_QTY } from "../../supabase/functions/_shared/orderPricing.ts";

describe("MAX_QTY", () => {
  it("matches the server's limit, so + never offers a quantity create-order refuses", () => {
    expect(MAX_QTY).toBe(SERVER_MAX_QTY);
  });
});
