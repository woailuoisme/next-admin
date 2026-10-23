import { describe, expect, it, vi } from "vitest";

import { actionsCol } from "@/components/data-table/columns/action";
import { DataTable } from "@/components/data-table/core/DataTable";
import { TableEmptyState } from "@/components/data-table/empty-state/TableEmptyState";
import { DataTableBatchActionBar } from "@/components/data-table/footer/DataTableBatchActionBar";
import { DataTablePagination } from "@/components/data-table/footer/DataTablePagination";
import { DataTableSummaryRow } from "@/components/data-table/footer/DataTableSummaryRow";
import { DataTableQuickFilter } from "@/components/data-table/toolbar/items/DataTableQuickFilter";
import {
  QueryBuilderControl,
  getOperatorsForColumn,
} from "@/components/data-table/toolbar/filters/controls/QueryBuilderControl";
import { renderWithProviders, screen } from "test/test-utils";
import type { MessageKeyOf } from "@/types/i18n";

const mockColumns = [
  { field: "id", headerName: "ID" },
  { field: "name", headerName: "Name" },
];

describe("DataTable i18n", () => {
  it("renders toolbar, empty state and pagination in Chinese by default", () => {
    renderWithProviders(<DataTable data={[]} columns={mockColumns} />);

    expect(screen.getByText("列设置")).toBeInTheDocument();
    expect(screen.getByText("密度")).toBeInTheDocument();
    expect(screen.getByText("导出")).toBeInTheDocument();
    expect(screen.getByText("暂无数据")).toBeInTheDocument();
    expect(screen.getByText("第 0 至 0 条，共 0 条")).toBeInTheDocument();
    expect(screen.getByText("每页")).toBeInTheDocument();
  });

  it("switches the whole table to English through next-intl", () => {
    renderWithProviders(<DataTable data={[]} columns={mockColumns} />, { locale: "en" });

    expect(screen.getByText("Columns")).toBeInTheDocument();
    expect(screen.getByText("Density")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
    expect(screen.getByText("No records found.")).toBeInTheDocument();
    expect(screen.getByText("Showing 0 to 0 of 0 entries")).toBeInTheDocument();
    expect(screen.getByText("Per page")).toBeInTheDocument();
  });

  it("localizes CRUD action column headers and buttons", () => {
    const columnsWithActions = [
      ...mockColumns,
      actionsCol({ crud: { onView: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() } }),
    ];
    const data = [{ id: "1", name: "Alice" }];

    const zh = renderWithProviders(
      <DataTable data={data} columns={columnsWithActions} showToolbar={false} hidePagination />,
    );
    expect(screen.getByText("操作")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "查看" })).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<DataTable data={data} columns={columnsWithActions} showToolbar={false} hidePagination />, {
      locale: "en",
    });
    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
  });

  it("localizes the batch action bar", () => {
    const selected = [{ id: "1" }, { id: "2" }];

    const zh = renderWithProviders(<DataTableBatchActionBar selectedRows={selected} onClearSelection={vi.fn()} />);
    expect(screen.getByText("已选中 2 项")).toBeInTheDocument();
    expect(screen.getByText("取消选择")).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<DataTableBatchActionBar selectedRows={selected} onClearSelection={vi.fn()} />, {
      locale: "en",
    });
    expect(screen.getByText("2 selected")).toBeInTheDocument();
    expect(screen.getByText("Deselect")).toBeInTheDocument();
  });

  it("localizes the query builder", () => {
    const props = {
      filterableColumns: mockColumns,
      rules: [],
      onAddRule: vi.fn(),
      onUpdateRule: vi.fn(),
      onRemoveRule: vi.fn(),
    };

    const zh = renderWithProviders(<QueryBuilderControl {...props} />);
    expect(screen.getByText("高级自定义规则")).toBeInTheDocument();
    expect(screen.getByText("添加条件")).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<QueryBuilderControl {...props} />, { locale: "en" });
    expect(screen.getByText("Custom Conditions")).toBeInTheDocument();
    expect(screen.getByText("Add condition")).toBeInTheDocument();
  });

  it("resolves operator labels from the provided translator", () => {
    const dict: Record<string, string> = { op_contains: "包含", op_equals: "等于 (=)" };
    const enDict: Record<string, string> = { op_contains: "contains", op_equals: "equals (=)" };
    const zhTranslator = (key: MessageKeyOf<"table">) => dict[key] ?? key;
    const enTranslator = (key: MessageKeyOf<"table">) => enDict[key] ?? key;

    expect(getOperatorsForColumn("string", zhTranslator).find((op) => op.value === "contains")?.label).toBe("包含");
    expect(getOperatorsForColumn("string", enTranslator).find((op) => op.value === "equals")?.label).toBe("equals (=)");
  });

  it("renders pagination from the message file without any parent provider", () => {
    renderWithProviders(
      <DataTablePagination
        paginationModel={{ page: 1, pageSize: 10 }}
        onPaginationModelChange={vi.fn()}
        rowCount={100}
      />,
    );

    expect(screen.getByText("第 1 至 10 条，共 100 条")).toBeInTheDocument();
    expect(screen.getByText("每页")).toBeInTheDocument();
  });

  it("localizes the summary row", () => {
    renderWithProviders(
      <DataTableSummaryRow
        rows={[{ name: "A", price: 100 }]}
        columns={[{ field: "price", headerName: "Price", aggregation: "sum" }]}
      />,
    );

    expect(screen.getByText("求和:")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("localizes the quick filter placeholder", () => {
    const zh = renderWithProviders(<DataTableQuickFilter value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText("搜索表格内容...")).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<DataTableQuickFilter value="" onChange={vi.fn()} />, { locale: "en" });
    expect(screen.getByPlaceholderText("Search records...")).toBeInTheDocument();
  });

  it("renders TableEmptyState from the built-in zh messages", () => {
    renderWithProviders(<TableEmptyState heading="暂无数据" description="请尝试调整搜索或筛选条件" />);
    expect(screen.getByText("暂无数据")).toBeInTheDocument();
  });
});
