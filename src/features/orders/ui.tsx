"use client";

import { sumBy } from "es-toolkit";
import { Clock, DollarSign, PackageCheck, Printer, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { col } from "@/components/data-table/columns/col";
import { Infolist } from "@/components/infolist";
import { ActionSelectEntry, RepeatableEntry, SummaryEntry, TextEntry } from "@/components/infolist/entries";
import { InfolistSection } from "@/components/infolist/layout";
import { defineResourceUI } from "@/components/resource";
import { Badge } from "@/components/ui/badge";
import { useResourceAction } from "@/lib/resource";

import { computeOrderStats, ORDER_STATUS_OPTIONS, orderResource } from "./resource";
import type { Order, OrderItem, OrderStatus } from "./types";

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

const STATUS_LABEL_KEY_MAP = Object.fromEntries(ORDER_STATUS_OPTIONS.map((opt) => [opt.value, opt.labelKey])) as Record<
  OrderStatus,
  (typeof ORDER_STATUS_OPTIONS)[number]["labelKey"]
>;

const getItemsQuantity = (row: Order) => sumBy(row.items, (item) => item.quantity);

function OrderDetailInfolist({ order }: { order: Order | null }) {
  const t = useTranslations("orders");
  const statusMutation = useResourceAction(orderResource, "updateStatus");

  const statusOptions = useMemo(
    () => ORDER_STATUS_OPTIONS.map((item) => ({ value: item.value, label: t(item.labelKey) })),
    [t],
  );

  if (!order) return null;

  return (
    <div className="space-y-5 text-xs">
      <ActionSelectEntry<OrderStatus>
        label={t("detail_fulfillment")}
        icon={Clock}
        value={order.status}
        options={statusOptions}
        placeholder={t("update_status")}
        isPending={statusMutation.isPending}
        pendingText={t("detail_updating")}
        onChange={async (status) => {
          await statusMutation.mutateAsync({ id: order.id, status });
        }}
      />

      <Infolist record={order} dense>
        <InfolistSection title={t("detail_customer_info")} columns={1} card>
          <TextEntry name="customerName" label={t("detail_full_name")} />
          <TextEntry name="customerEmail" label={t("detail_email")} format="email" copyable />
          <TextEntry name="shippingAddress" label={t("detail_shipping_destination")} />
        </InfolistSection>

        <InfolistSection title={t("detail_line_items")} columns={1}>
          <RepeatableEntry<OrderItem>
            name="items"
            variant="card"
            keyExtractor={(item) => item.productId}
            itemTitle={(item) => item.productTitle}
          >
            {(item) => (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {t("detail_qty", { count: item.quantity })} ${item.price.toFixed(2)}
                </span>
                <span className="text-foreground font-semibold">${(item.quantity * item.price).toFixed(2)}</span>
              </div>
            )}
          </RepeatableEntry>
        </InfolistSection>
      </Infolist>

      <SummaryEntry
        items={[
          { label: t("detail_subtotal"), value: order.subtotal },
          { label: t("detail_tax"), value: order.tax },
          { label: t("detail_shipping"), value: order.shipping },
        ]}
        total={{ label: t("detail_total_billed"), value: order.total }}
      />
    </div>
  );
}

export const orderUI = defineResourceUI(orderResource, {
  stats: {
    columns: 4,
    sparklineLayout: "inline",
    build: ({ rows, total, rawResponse, t }) => {
      const stats = computeOrderStats(rows, total, rawResponse?.summary);
      const pendingCount = stats?.pendingCount ?? 0;
      return [
        {
          id: "total",
          title: t("metric_total_title"),
          value: stats?.total ?? 0,
          icon: ShoppingCart,
          theme: "chart-1",
          description: t("metric_total_desc"),
          trend: { value: "+12.4%", direction: "up", label: t("metric_total_trend") },
          sparklineData: stats?.sparklines?.totalOrders,
          sparklineType: "bar",
        },
        {
          id: "pending",
          title: t("metric_pending_title"),
          value: pendingCount,
          icon: Clock,
          theme: "chart-3",
          description: t("metric_pending_desc"),
          trend: {
            value: pendingCount > 0 ? t("metric_pending_need_action") : t("metric_pending_cleared"),
            direction: "neutral",
            tone: pendingCount > 0 ? "negative" : "neutral",
          },
          sparklineData: stats?.sparklines?.pending,
        },
        {
          id: "delivered",
          title: t("metric_delivered_title"),
          value: stats?.deliveredCount ?? 0,
          icon: PackageCheck,
          theme: "chart-2",
          description: t("metric_delivered_desc"),
          trend: { value: "95.6%", direction: "up", label: t("metric_delivered_trend") },
          sparklineData: stats?.sparklines?.delivered,
        },
        {
          id: "aov",
          title: t("metric_aov_title"),
          value: stats?.avgOrderValue ?? 0,
          formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
          prefix: "$",
          icon: DollarSign,
          theme: "chart-4",
          description: t("metric_aov_desc"),
          trend: { value: "+5.2%", direction: "up", label: t("metric_aov_trend") },
          sparklineData: stats?.sparklines?.avgOrderValue,
        },
      ];
    },
  },
  table: {
    pinnedColumns: PINNED_COLUMNS,
    exportFileName: "orders-export.csv",
    onRowClick: "view",
    filters: (t) => [
      {
        type: "select",
        field: "status",
        label: t("col_status"),
        placeholder: t("filter_status_placeholder"),
        options: ORDER_STATUS_OPTIONS.map((opt) => ({ label: t(opt.labelKey), value: opt.value })),
      },
    ],
    columns: ({ t }) => {
      const statusLabelMap = Object.fromEntries(
        ORDER_STATUS_OPTIONS.map((opt) => [opt.value, t(opt.labelKey)]),
      ) as Record<string, string>;

      return [
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
        col.date<Order>("createdAt", t("col_date_placed"), { width: 150 }),
        col.number<Order>("items", t("col_items"), {
          width: 120,
          valueGetter: getItemsQuantity,
          suffix: t("unit_orders"),
        }),
        col.currency<Order>("total", t("col_total"), { width: 150 }),
        col.badge<Order>("status", t("col_status"), {
          width: 130,
          dot: true,
          variantMap: STATUS_VARIANT_MAP,
          labelMap: statusLabelMap,
        }),
      ];
    },
    rowActions: (t) => ({
      field: "actions",
      headerName: t("col_details"),
      width: 80,
      crud: {
        view: true,
        viewLabel: t("action_inspect"),
      },
    }),
    batchActions: [
      {
        id: "export-json",
        kind: "exportJson",
        label: ({ selectedCount, t }) => t("export_json", { count: selectedCount }),
        exportFileName: (selectedCount) => `selected-orders-${selectedCount}.json`,
      },
      {
        id: "print-selected",
        kind: "custom",
        icon: Printer,
        label: ({ t }) => t("print_selected"),
        onClick: () => {
          window.print();
        },
      },
    ],
  },
  infolist: {
    size: "md",
    badge: (order, t) => {
      if (!order) return null;
      const labelKey = STATUS_LABEL_KEY_MAP[order.status];
      return (
        <Badge variant="outline" className="text-xs font-semibold">
          {labelKey ? t(labelKey) : order.status}
        </Badge>
      );
    },
    description: (order, t) =>
      order ? t("detail_placed_on", { date: new Date(order.createdAt).toLocaleString() }) : t("detail_sheet_desc"),
    render: ({ entity }) => <OrderDetailInfolist order={entity} />,
  },
});

export const OrdersListView = orderUI.ListView;
export const OrdersActionView = orderUI.ActionView;
