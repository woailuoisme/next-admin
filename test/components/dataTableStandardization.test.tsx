import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ColorCell } from "@/components/data-table/cells/display/ColorCell";
import { UserCell } from "@/components/data-table/cells/display/UserCell";
import { DataTableBatchActionBar } from "@/components/data-table/footer/DataTableBatchActionBar";
import { ActiveFilterPills } from "@/components/data-table/toolbar/filters/layouts/ActiveFilterPills";
import { DataTableSavedViews } from "@/components/data-table/toolbar/items/DataTableSavedViews";
import { DataTableStatusTabs } from "@/components/data-table/toolbar/items/DataTableStatusTabs";
import { renderWithProviders, screen } from "test/test-utils";

describe("DataTable Standardization & Best Practices", () => {
  describe("DataTableStatusTabs", () => {
    it("renders tabs with Shadcn Tabs and Badges and triggers tab switch", () => {
      const onTabChange = vi.fn();
      const tabs = [
        { id: "all", label: "全部", badge: 42 },
        { id: "active", label: "进行中", badge: 12 },
        { id: "archived", label: "已归档", badge: 30 },
      ];

      renderWithProviders(<DataTableStatusTabs tabs={tabs} activeTab="all" onTabChange={onTabChange} />, {
        locale: "zh",
      });

      expect(screen.getByRole("tab", { name: /全部/i })).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();

      const activeTabBtn = screen.getByRole("tab", { name: /进行中/i });
      fireEvent.click(activeTabBtn);
      expect(onTabChange).toHaveBeenCalledWith("active");
    });
  });

  describe("ActiveFilterPills", () => {
    it("renders active filter badges and handles removal", () => {
      const onFilterModelChange = vi.fn();
      const filterModel = {
        items: [{ id: "r1", field: "status", operator: "equals" as const, value: "published" }],
        quickFilterValues: ["electronics"],
      };
      const columns = [{ field: "status", headerName: "状态" }];

      renderWithProviders(
        <ActiveFilterPills filterModel={filterModel} onFilterModelChange={onFilterModelChange} columns={columns} />,
        { locale: "zh" },
      );

      expect(screen.getByTestId("active-filter-pill-quick-search")).toHaveTextContent("electronics");
      expect(screen.getByTestId("active-filter-pill-r1")).toHaveTextContent('状态 = "published"');

      // Click remove button on quick search pill
      const quickSearchPill = screen.getByTestId("active-filter-pill-quick-search");
      const removeQuickBtn = quickSearchPill.querySelector("button");
      expect(removeQuickBtn).toBeTruthy();
      fireEvent.click(removeQuickBtn!);
      expect(onFilterModelChange).toHaveBeenCalledWith(expect.objectContaining({ quickFilterValues: [] }));
    });
  });

  describe("DataTableSavedViews", () => {
    it("renders view trigger with badge count", () => {
      const onApplyView = vi.fn();
      const onSaveCurrentView = vi.fn();
      const views = [
        { id: "v1", name: "默认视图", isSystem: true },
        { id: "v2", name: "待处理订单" },
      ];

      renderWithProviders(
        <DataTableSavedViews
          views={views}
          activeViewId="v1"
          onApplyView={onApplyView}
          onSaveCurrentView={onSaveCurrentView}
        />,
        { locale: "zh" },
      );

      // Trigger button should show active view name and badge count
      expect(screen.getByRole("button", { name: /默认视图/i })).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  describe("DataTableBatchActionBar", () => {
    it("renders floating action bar and triggers clear selection", () => {
      const onClearSelection = vi.fn();
      const selectedRows = [
        { id: "1", name: "Item A" },
        { id: "2", name: "Item B" },
      ];

      renderWithProviders(<DataTableBatchActionBar selectedRows={selectedRows} onClearSelection={onClearSelection} />, {
        locale: "zh",
      });

      expect(screen.getByText(/已选中 2 项/i)).toBeInTheDocument();
      const deselectBtn = screen.getByRole("button", { name: /取消选择/i });
      fireEvent.click(deselectBtn);
      expect(onClearSelection).toHaveBeenCalled();
    });
  });

  describe("ColorCell & UserCell display", () => {
    it("renders ColorCell with swatch and hex", () => {
      renderWithProviders(<ColorCell value="#3b82f6" copyable showHex />, { locale: "zh" });
      expect(screen.getByText("#3b82f6")).toBeInTheDocument();
      expect(screen.getByLabelText("Color swatch: #3b82f6")).toBeInTheDocument();
    });

    it("renders UserCell with name, subtitle, and avatar fallback", () => {
      renderWithProviders(<UserCell name="张三" subtitle="前端工程师" />, { locale: "zh" });
      expect(screen.getAllByText("张三").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("前端工程师")).toBeInTheDocument();
    });
  });
});
