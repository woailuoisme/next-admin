import { sumBy } from "es-toolkit";
import { FileDown, Printer } from "lucide-react";
import { useMemo } from "react";

import {
  col,
  type DataTableColDef,
  type DataTableFilterDefinition,
  ResourceTable,
} from "@/components/data-table";
import { Button } from "@/components/ui/button";

import type { Order } from "../types";

import { orderQueries } from "../queries";

interface OrdersTableProps {
  orders?: Order[];
  total?: number;
  loading?: boolean;
  onViewOrder?: (orderId: string) => void;
  onSelectOrder?: (orderId: string) => void;
}

const STATUS_VARIANT_MAP = {
  delivered: "success",
  shipped: "info",
  processing: "secondary",
  pending: "warning",
  cancelled: "destructive",
} as const;

const ORDER_FILTERS: DataTableFilterDefinition[] = [
  {
    type: "select",
    field: "status",
    label: "Status",
    placeholder: "All order statuses",
    options: [
      { label: "Pending", value: "pending" },
      { label: "Processing", value: "processing" },
      { label: "Shipped", value: "shipped" },
      { label: "Delivered", value: "delivered" },
      { label: "Cancelled", value: "cancelled" },
    ],
  },
];

const PINNED_COLUMNS = Object.freeze({
  left: ["orderNumber", "customerName"],
  right: ["actions"],
});

const SLOT_PROPS = Object.freeze({
  toolbar: {
    exportFileName: "orders-export.csv",
    quickFilterPlaceholder: "Search orders in view...",
  },
});

const getOrderRowId = (row: Order) => row.id;
const getItemsQuantity = (row: Order) => sumBy(row.items, (item) => item.quantity);

function exportOrdersJson(selectedRows: Order[], clearSelection: () => void) {
  const json = JSON.stringify(selectedRows, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `selected-orders-${selectedRows.length}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  clearSelection();
}

export function OrdersTable({
  orders,
  total,
  loading,
  onViewOrder,
  onSelectOrder,
}: OrdersTableProps) {
  const columns = useMemo<DataTableColDef<Order>[]>(
    () => [
      col.text<Order>("orderNumber", "Order #", {
        mono: true,
        copyable: true,
        width: 150,
        pinned: "left",
      }),
      col.text<Order>("customerName", "Customer", {
        width: 240,
        flex: 1,
        pinned: "left",
        description: (r) => r.customerEmail,
        copyable: (r) => r.customerEmail,
        weight: "semibold",
      }),
      col.date<Order>("createdAt", "Date Placed", {
        width: 130,
      }),
      col.number<Order>("items", "Items", {
        width: 120,
        aggregation: "sum",
        valueGetter: getItemsQuantity,
        suffix: " items",
      }),
      col.currency<Order>("total", "Total Amount", {
        width: 150,
        aggregation: "sum",
      }),
      col.badge<Order>("status", "Status", {
        width: 130,
        dot: true,
        variantMap: STATUS_VARIANT_MAP,
      }),
      col.actions<Order>({
        field: "actions",
        headerName: "Details",
        width: 80,
        crud: {
          onView: (row) => (onViewOrder ?? onSelectOrder)?.(row.id),
          viewLabel: "Inspect Order",
        },
      }),
    ],
    [onViewOrder, onSelectOrder],
  );

  return (
    <ResourceTable<Order>
      queryOptions={!orders ? orderQueries.list : undefined}
      data={orders}
      columns={columns}
      getRowId={getOrderRowId}
      checkboxSelection
      loading={loading}
      total={total}
      pinnedColumns={PINNED_COLUMNS}
      filters={ORDER_FILTERS}
      summaryRow
      onRowClick={onSelectOrder ? (row) => onSelectOrder(row.id) : undefined}
      slotProps={SLOT_PROPS}
      batchActions={(selectedRows, clearSelection) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 rounded-full text-xs"
            onClick={() => exportOrdersJson(selectedRows, clearSelection)}
          >
            <FileDown className="text-muted-foreground size-3.5" />
            <span>Export JSON ({selectedRows.length})</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 rounded-full text-xs"
            onClick={() => {
              window.print();
            }}
          >
            <Printer className="text-muted-foreground size-3.5" />
            <span>Print Selected</span>
          </Button>
        </div>
      )}
    />
  );
}
