import { describe, expect, it } from "vitest";
import { ADMIN_SECTIONS, adminPath, afterLoginPath, sectionFromParam } from "./adminSections";

describe("sectionFromParam", () => {
  it("opens the dashboard on plain /admin", () => {
    expect(sectionFromParam(undefined)).toBe("dashboard");
    expect(sectionFromParam("")).toBe("dashboard");
  });

  it("opens the tab named in the URL", () => {
    expect(sectionFromParam("orders")).toBe("orders");
    expect(sectionFromParam("leads")).toBe("leads");
    expect(sectionFromParam("Orders")).toBe("orders");
  });

  it("rejects an unknown tab", () => {
    expect(sectionFromParam("settings")).toBeNull();
    expect(sectionFromParam("login")).toBeNull();
  });

  it("round-trips every tab through its URL", () => {
    for (const s of ADMIN_SECTIONS) {
      const seg = adminPath(s).split("/")[2];
      expect(sectionFromParam(seg)).toBe(s);
    }
  });
});

describe("adminPath", () => {
  it("keeps /admin for the dashboard", () => {
    expect(adminPath("dashboard")).toBe("/admin");
    expect(adminPath("orders")).toBe("/admin/orders");
  });
});

describe("afterLoginPath", () => {
  it("returns to the admin tab that needed a login", () => {
    expect(afterLoginPath("/admin/orders")).toBe("/admin/orders");
    expect(afterLoginPath("/admin/leads?lang=hi")).toBe("/admin/leads?lang=hi");
    expect(afterLoginPath("/admin")).toBe("/admin");
  });

  it("falls back to /admin for anything else", () => {
    for (const bad of [undefined, null, 42, "", "/", "/checkout", "https://evil.example/admin", "//evil.example/admin", "/admin/login", "/admin/orders/../../x", "/administrator"]) {
      expect(afterLoginPath(bad)).toBe("/admin");
    }
  });
});
