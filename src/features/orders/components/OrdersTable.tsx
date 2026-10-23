import { sumBy } from "es-toolkit";
import { FileDown, Printer } from "lucide-react";
import { useMemo } from "react";

import {
  col,
  type DataTableColDef,
  type DataTableFilterDefinition,
  exportRowsAsJson,
  ResourceTable,
} from "@/components/data-table";
import { Button } from "@/components/ui/button";

import type { Order } from "../types";

import { orderQueries } from "../queries";
import { useTranslations } from "next-intl";

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

const PINNED_COLUMNS = Object.freeze({
  left: ["orderNumber", "customerName"],
  right: ["actions"],
});

const SLOT_PROPS = Object.freeze({
  toolbar: {
    exportFileName: "orders-export.csv",
  },
});

const getOrderRowId = (row: Order) => row.id;
const getItemsQuantity = (row: Order) => sumBy(row.items, (item) => item.quantity);

const exportOrdersJson = (selectedRows: Order[], clearSelection: () => void) =>
  exportRowsAsJson(selectedRows, `selected-orders-${selectedRows.length}.json`, clearSelection);

export function OrdersTable({ orders, total, loading, onViewOrder, onSelectOrder }: OrdersTableProps) {
  const t = useTranslations("orders");

  const statusLabelMap = useMemo<Record<string, string>>(
    () => ({
      pending: t("status_pending"),
      processing: t("status_processing"),
      shipped: t("status_shipped"),
      delivered: t("status_delivered"),
      cancelled: t("status_cancelled"),
    }),
    [t],
  );

  const orderFilters = useMemo<DataTableFilterDefinition[]>(
    () => [
      {
        type: "select",
        field: "status",
        label: t("col_status"),
        placeholder: t("filter_status_placeholder"),
        options: [
          { label: t("status_pending"), value: "pending" },
          { label: t("status_processing"), value: "processing" },
          { label: t("status_shipped"), value: "shipped" },
          { label: t("status_delivered"), value: "delivered" },
          { label: t("status_cancelled"), value: "cancelled" },
        ],
      },
    ],
    [t],
  );

  const columns = useMemo<DataTableColDef<Order>[]>(
    () => [
      col.text<Order>("orderNumber", t("col_order_number"), {
        mono: true,
        copyable: true,
        width: 150,
        pinned: "left",
      }),
      col.text<Order>("customerName", t("col_customer"), {
        width: 240,
        flex: 1,
        pinned: "left",
        description: (r) => r.customerEmail,
        copyable: (r) => r.customerEmail,
        weight: "semibold",
      }),
      col.date<Order>("createdAt", t("col_date_placed"), {
        width: 150,
      }),
      col.number<Order>("items", t("col_items"), {
        width: 120,
        valueGetter: getItemsQuantity,
        suffix: t("unit_orders"),
      }),
      col.currency<Order>("total", t("col_total"), {
        width: 150,
      }),
      col.badge<Order>("status", t("col_status"), {
        width: 130,
        dot: true,
        variantMap: STATUS_VARIANT_MAP,
        labelMap: statusLabelMap,
      }),
      col.actions<Order>({
        field: "actions",
        headerName: t("col_details"),
        width: 80,
        crud: {
          onView: (row) => (onViewOrder ?? onSelectOrder)?.(row.id),
          viewLabel: t("action_inspect"),
        },
      }),
    ],
    [onViewOrder, onSelectOrder, statusLabelMap, t],
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
      filters={orderFilters}
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
            <span>{t("export_json", { count: selectedRows.length })}</span>
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
            <span>{t("print_selected")}</span>
          </Button>
        </div>
      )}
    />
  );
}
