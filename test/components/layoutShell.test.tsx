import { cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { GlobalSearch } from "@/components/layout/search/GlobalSearch";
import { GlobalSearchTrigger } from "@/components/layout/search/GlobalSearchTrigger";
import { NavBadge } from "@/components/layout/sidebar/nav-main/NavBadge";
import { NavMain } from "@/components/layout/sidebar/nav-main/NavMain";
import { hasActiveSubItem, isPathActive } from "@/components/layout/sidebar/nav-main/utils";
import {
  getAuthorizedMenu,
  getFlatNavItems,
  getRouteTitle,
  getSidebarMenuGroups,
} from "@/components/layout/sidebar/menu.config";
import { SidebarProvider } from "@/components/ui/sidebar";
import { renderWithProviders, screen } from "test/test-utils";

afterEach(() => {
  cleanup();
});

describe("DashboardShell Architecture & Accessibility", () => {
  it("renders skip-to-content accessibility link and main container", () => {
    renderWithProviders(
      <DashboardShell>
        <div data-testid="test-content">Dashboard Content</div>
      </DashboardShell>,
    );

    const skipLink = screen.getByRole("link", { name: "跳至主体内容" });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");

    const mainContainer = document.getElementById("main-content");
    expect(mainContainer).toBeInTheDocument();
    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("renders English skip-to-content link when locale is en", () => {
    renderWithProviders(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>,
      { locale: "en" },
    );

    const skipLink = screen.getByRole("link", { name: "Skip to main content" });
    expect(skipLink).toBeInTheDocument();
  });
});

describe("HeaderNav & Breadcrumbs", () => {
  it("renders breadcrumb navigation with page title", () => {
    renderWithProviders(
      <SidebarProvider>
        <HeaderNav />
      </SidebarProvider>,
    );

    expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute("href", "/overview");
  });

  it("dynamically resolves route title from menu configuration", () => {
    expect(getRouteTitle("/overview")).toBe("概览");
    expect(getRouteTitle("/products")).toBe("商品管理");
    expect(getRouteTitle("/showcase/tables")).toBe("数据表格");
    expect(getRouteTitle("/unknown-custom-page")).toBe("Unknown Custom Page");
  });
});

describe("Sidebar Navigation & Subsystem", () => {
  it("renders NavBadge with shadcn Badge component semantics", () => {
    const { container } = renderWithProviders(<NavBadge badge={42} />);
    const badge = container.querySelector("[data-slot='badge']");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("42");
  });

  it("returns null when NavBadge badge is undefined", () => {
    const { container } = renderWithProviders(<NavBadge badge={undefined} />);
    expect(container.querySelector("[data-slot='badge']")).toBeNull();
  });

  it("verifies path matching helpers isPathActive & hasActiveSubItem", () => {
    expect(isPathActive("/products", "/products")).toBe(true);
    expect(isPathActive("/products", "/products/123")).toBe(true);
    expect(isPathActive("/products", "/categories")).toBe(false);
    expect(isPathActive(undefined, "/products")).toBe(false);

    const testItem = {
      title: "Catalog",
      icon: () => null,
      items: [
        { title: "Products", to: "/products" },
        { title: "Categories", to: "/categories" },
      ],
    };

    expect(hasActiveSubItem(testItem, "/products/detail")).toBe(true);
    expect(hasActiveSubItem(testItem, "/users")).toBe(false);
    expect(hasActiveSubItem({ title: "No Sub", icon: () => null }, "/any")).toBe(false);
  });

  it("filters menu groups by user role", () => {
    const customGroups = [
      {
        title: "Admin Only",
        roles: ["super_admin"],
        items: [{ title: "Settings", to: "/admin/settings", icon: () => null }],
      },
      {
        title: "General",
        items: [{ title: "Home", to: "/home", icon: () => null }],
      },
    ];

    // No role provided: returns all
    expect(getAuthorizedMenu(customGroups)).toHaveLength(2);

    // Regular user role: filters out super_admin group
    const userGroups = getAuthorizedMenu(customGroups, "user");
    expect(userGroups).toHaveLength(1);
    expect(userGroups[0].title).toBe("General");

    // Super admin role: keeps both
    const adminGroups = getAuthorizedMenu(customGroups, "super_admin");
    expect(adminGroups).toHaveLength(2);
  });

  it("flattens menu groups into searchable navigation items", () => {
    const menuGroups = getSidebarMenuGroups();
    const flatItems = getFlatNavItems(menuGroups);

    expect(flatItems.length).toBeGreaterThan(5);
    const overviewItem = flatItems.find((item) => item.to === "/overview");
    expect(overviewItem).toBeDefined();
    expect(overviewItem?.title).toBe("概览");
  });

  it("renders NavMain inside a SidebarProvider", () => {
    const menuGroups = getSidebarMenuGroups();

    renderWithProviders(
      <SidebarProvider>
        <NavMain groups={menuGroups} />
      </SidebarProvider>,
    );

    expect(screen.getByText("概览")).toBeInTheDocument();
  });
});

describe("Global Search Subsystem", () => {
  it("renders GlobalSearchTrigger and triggers click handler", () => {
    let clicked = false;
    renderWithProviders(<GlobalSearchTrigger onClick={() => (clicked = true)} />);

    const triggerBtn = screen.getByRole("button", { name: /全局搜索/ });
    expect(triggerBtn).toBeInTheDocument();
    fireEvent.click(triggerBtn);
    expect(clicked).toBe(true);
  });

  it("renders GlobalSearch within HeaderNav without eager dialog DOM mounting", () => {
    renderWithProviders(
      <SidebarProvider>
        <GlobalSearch />
      </SidebarProvider>,
    );

    // Trigger button is present
    expect(screen.getByRole("button", { name: /全局搜索/ })).toBeInTheDocument();

    // The dialog should NOT be mounted eagerly before being triggered (code splitting)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
