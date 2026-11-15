"use client";

import { AlertTriangle, CheckCircle2, DollarSign, Package } from "lucide-react";
import dynamic from "next/dynamic";

import { BadgeCell } from "@/components/data-table/cells/display/BadgeCell";
import { col } from "@/components/data-table/columns/col";
import type { DataTableRenderCellParams } from "@/components/data-table/core";
import { defineResourceUI } from "@/components/resource";

import { computeProductStats, productResource } from "./resource";
import type { Product } from "./types";

const ProductForm = dynamic(() => import("./components/ProductForm").then((m) => m.ProductForm), {
  ssr: false,
});

const STATUS_VARIANT_MAP: Record<string, "success" | "secondary"> = {
  active: "success",
  draft: "secondary",
};

const PINNED_COLUMNS = {
  left: ["imageUrl", "title"],
  right: ["actions"],
};

export const productUI = defineResourceUI(productResource, {
  stats: {
    columns: 4,
    build: ({ rows, total, rawResponse, t }) => {
      const stats = computeProductStats(rows, total, rawResponse?.summary);
      const lowStockCount = stats?.lowStockCount ?? 0;
      return [
        {
          id: "total",
          title: t("metric_total_title"),
          value: stats?.total ?? 0,
          icon: Package,
          theme: "chart-4",
          description: t("metric_total_desc"),
          trend: { value: "+4.5%", direction: "up", label: t("metric_total_trend") },
          sparklineData: stats?.sparklines?.totalSku,
        },
        {
          id: "active",
          title: t("metric_active_title"),
          value: stats?.activeCount ?? 0,
          icon: CheckCircle2,
          theme: "chart-2",
          description: t("metric_active_desc"),
          trend: { value: "98.2%", direction: "neutral", label: t("metric_active_trend") },
          sparklineData: stats?.sparklines?.activeSku,
        },
        {
          id: "lowStock",
          title: t("metric_low_stock_title"),
          value: lowStockCount,
          icon: AlertTriangle,
          theme: "chart-3",
          description: t("metric_low_stock_desc"),
          trend: {
            value: lowStockCount > 0 ? t("metric_low_stock_need_restock") : t("metric_low_stock_normal"),
            direction: lowStockCount > 0 ? "down" : "neutral",
            tone: lowStockCount > 0 ? "negative" : "neutral",
          },
          sparklineData: stats?.sparklines?.lowStock,
          sparklineType: "bar",
        },
        {
          id: "avgPrice",
          title: t("metric_avg_price_title"),
          value: stats?.avgPrice ?? 0,
          formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
          prefix: "$",
          icon: DollarSign,
          theme: "chart-1",
          description: t("metric_avg_price_desc"),
          trend: { value: "+1.8%", direction: "up", label: t("metric_avg_price_trend") },
          sparklineData: stats?.sparklines?.avgPrice,
        },
      ];
    },
  },
  table: {
    pinnedColumns: PINNED_COLUMNS,
    exportFileName: "products-catalog.csv",
    filters: (t) => [
      {
        type: "select",
        field: "status",
        label: t("col_status"),
        placeholder: t("filter_status_placeholder"),
        options: [
          { label: t("status_active"), value: "active" },
          { label: t("status_draft"), value: "draft" },
        ],
      },
      {
        type: "select",
        field: "categoryName",
        label: t("col_category"),
        placeholder: t("filter_category_placeholder"),
        options: [
          { label: t("category_electronics"), value: "Electronics" },
          { label: t("category_clothing"), value: "Clothing" },
          { label: t("category_home"), value: "Home" },
          { label: t("category_accessories"), value: "Accessories" },
        ],
      },
    ],
    columns: ({ t }) => {
      const statusLabelMap = { active: t("status_active"), draft: t("status_draft") };
      return [
        col.avatar<Product>("imageUrl", t("col_item"), {
          width: 70,
          pinned: "left",
          shape: "rounded",
          size: "md",
        }),
        col.text<Product>("title", t("col_product_info"), {
          description: (r) => r.slug,
          copyable: (r) => r.slug,
          flex: 1,
          width: 260,
          pinned: "left",
          weight: "semibold",
        }),
        col.badge<Product>("categoryName", t("col_category"), {
          width: 140,
          variant: "outline",
        }),
        {
          field: "price",
          headerName: t("col_financials"),
          width: 180,
          type: "number",
          sortable: true,
          renderCell: ({ row }: DataTableRenderCellParams<Product>) => {
            const margin = row.price > 0 ? Math.round(((row.price - row.costPrice) / row.price) * 100) : 0;
            return (
              <div className="text-xs">
                <span className="text-foreground font-mono font-bold">${row.price.toFixed(2)}</span>
                <div className="text-muted-foreground flex items-center gap-1 text-[10px]">
                  <span>
                    {t("cost_prefix")} ${row.costPrice.toFixed(2)}
                  </span>
                  <span className="text-chart-2 font-medium">
                    ({margin}
                    {t("margin_suffix")})
                  </span>
                </div>
              </div>
            );
          },
        },
        {
          field: "stock",
          headerName: t("col_inventory"),
          width: 130,
          type: "number",
          sortable: true,
          renderCell: ({ row }: DataTableRenderCellParams<Product>) => {
            if (row.stock === 0) {
              return <BadgeCell value={t("stock_out")} variant="destructive" />;
            }
            if (row.stock <= 10) {
              return <BadgeCell value={t("low_stock", { count: row.stock })} variant="warning" dot />;
            }
            return (
              <span className="text-muted-foreground font-mono text-xs">{t("in_stock", { count: row.stock })}</span>
            );
          },
        },
        col.badge<Product>("status", t("col_status"), {
          width: 100,
          dot: true,
          variantMap: STATUS_VARIANT_MAP,
          labelMap: statusLabelMap,
        }),
      ];
    },
    rowActions: (t) => ({
      field: "actions",
      headerName: t("col_actions"),
      width: 80,
      moreActionsLabel: t("col_actions"),
      crud: {
        edit: true,
        delete: true,
      },
    }),
    batchActions: [
      {
        id: "batch-export",
        kind: "exportJson",
        label: ({ selectedCount, t }) => t("batch_export", { count: selectedCount }),
        exportFileName: (selectedCount) => `products-selected-${selectedCount}.json`,
      },
      {
        id: "batch-delete",
        kind: "batchDelete",
        label: ({ selectedCount, t }) => t("batch_delete", { count: selectedCount }),
      },
    ],
  },
  form: {
    size: "xl",
    render: ({ form, isEditing }) => <ProductForm form={form} isEditing={isEditing} />,
  },
});

export const ProductsListView = productUI.ListView;
export const ProductsActionView = productUI.ActionView;
