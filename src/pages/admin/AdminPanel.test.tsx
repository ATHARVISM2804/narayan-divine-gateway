import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

vi.stubEnv("VITE_ADMIN_EMAIL", "admin@example.com");

// Signed in as the admin; every table query returns nothing.
vi.mock("@/lib/supabase", () => {
  const query = { select: () => query, order: () => query, then: (r: (v: unknown) => void) => r({ data: [] }) };
  return {
    supabase: {
      auth: { getUser: async () => ({ data: { user: { email: "admin@example.com" } } }), signOut: async () => ({}) },
      from: () => query,
    },
  };
});

// The tab contents are not under test, only which one is open.
vi.mock("./PujaManager", () => ({ default: () => <p>PUJAS TAB</p> }));
vi.mock("./ChadhavaManager", () => ({ default: () => <p>CHADHAVAS TAB</p> }));
vi.mock("./OrderManager", () => ({ default: () => <p>ORDERS TAB</p> }));
vi.mock("./LeadManager", () => ({ default: () => <p>LEADS TAB</p> }));
vi.mock("./TempleManager", () => ({ default: () => <p>TEMPLES TAB</p> }));
vi.mock("./ReviewManager", () => ({ default: () => <p>REVIEWS TAB</p> }));

const { default: AdminPanel } = await import("./AdminPanel");

const Where = () => <p data-testid="path">{useLocation().pathname}</p>;

const openAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/admin/:section?" element={<><AdminPanel /><Where /></>} />
      </Routes>
    </MemoryRouter>,
  );

describe("AdminPanel tab in the URL", () => {
  it("reopens the tab named in the URL (what a reload does)", async () => {
    openAt("/admin/orders");
    expect(await screen.findByText("ORDERS TAB")).toBeTruthy();
  });

  it("opens Leads on /admin/leads", async () => {
    openAt("/admin/leads");
    expect(await screen.findByText("LEADS TAB")).toBeTruthy();
  });

  it("opens the dashboard on plain /admin", async () => {
    openAt("/admin");
    expect(await screen.findByText("Total Poojas")).toBeTruthy();
  });

  it("puts the tab in the URL when one is clicked", async () => {
    openAt("/admin");
    await screen.findByText("Total Poojas");
    fireEvent.click(screen.getAllByRole("button", { name: "Orders" })[0]);
    expect(await screen.findByText("ORDERS TAB")).toBeTruthy();
    expect(screen.getByTestId("path").textContent).toBe("/admin/orders");
    fireEvent.click(screen.getAllByRole("button", { name: "Dashboard" })[0]);
    expect(screen.getByTestId("path").textContent).toBe("/admin");
  });

  it("sends an unknown tab to the dashboard", async () => {
    openAt("/admin/nonsense");
    expect(await screen.findByText("Total Poojas")).toBeTruthy();
    expect(screen.getByTestId("path").textContent).toBe("/admin");
  });
});

describe("AdminPanel keeps Orders and Leads loaded", () => {
  it("hides Orders on another tab instead of unmounting it (no re-download on return)", async () => {
    openAt("/admin/orders");
    await screen.findByText("ORDERS TAB");
    fireEvent.click(screen.getAllByRole("button", { name: "Leads" })[0]);
    expect(await screen.findByText("LEADS TAB")).toBeTruthy();
    const orders = screen.getByText("ORDERS TAB");
    expect(orders.closest("[hidden]")).not.toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: "Orders" })[0]);
    expect(screen.getByText("ORDERS TAB")).toBe(orders);
    expect(orders.closest("[hidden]")).toBeNull();
  });
});
