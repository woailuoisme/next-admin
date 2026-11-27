"use client";

import { AlertTriangle, CheckCircle2, DollarSign, Package } from "lucide-react";

import { action } from "@/components/actions";
import { defineResourceUI, type ResourceTranslateFn } from "@/components/resource";

import { computeProductStats, DEFAULT_PRODUCT_IMAGE, productInputSchema, productResource } from "./resource";
import { buildProductFormSchema } from "./schema";
import { productTableConfig } from "./table";
import type { Product, ProductInput } from "./types";

function buildProductHeaderActions(t: ResourceTranslateFn) {
	return [
		action.import<ProductInput>({
			id: "import-products",
			label: t("action_import"),
			rowSchema: productInputSchema,
			fields: [
				{ key: "title", label: t("title_label"), required: true, aliases: ["name", "商品名称"] },
				{ key: "slug", label: t("slug_label"), required: true },
				{ key: "price", label: t("price_label"), required: true, transform: (v) => Number(v) },
				{ key: "costPrice", label: t("cost_label"), required: true, transform: (v) => Number(v ?? 0) },
				{
					key: "stock",
					label: t("stock_label"),
					required: true,
					transform: (v) => Number.parseInt(String(v ?? 0), 10),
				},
				{ key: "categoryId", label: t("category_label"), required: true, transform: (v) => String(v ?? "").trim() },
				{
					key: "status",
					label: t("status_label"),
					required: true,
					transform: (v) =>
						String(v ?? "")
							.trim()
							.toLowerCase(),
				},
				{ key: "imageUrl", label: t("image_label"), transform: (v) => (v ? String(v) : DEFAULT_PRODUCT_IMAGE) },
				{ key: "description", label: t("desc_label"), required: true },
			],
			sampleRows: [
				{
					title: "Wireless Keyboard Pro",
					slug: "wireless-keyboard-pro",
					price: 129,
					costPrice: 65,
					stock: 40,
					categoryId: "cat-1",
					status: "active",
					imageUrl: DEFAULT_PRODUCT_IMAGE,
					description: "Compact wireless mechanical keyboard with aluminum frame.",
				},
			],
		}),
		action.export<void, Product>({
			id: "export-products",
			label: t("action_export"),
			fileName: "products-catalog",
			columns: [
				{ field: "id", headerName: "ID" },
				{ field: "title", headerName: t("title_label") },
				{ field: "slug", headerName: t("slug_label") },
				{ field: "categoryName", headerName: t("col_category") },
				{ field: "price", headerName: t("price_label") },
				{ field: "costPrice", headerName: t("cost_label") },
				{ field: "stock", headerName: t("col_inventory") },
				{ field: "status", headerName: t("col_status") },
			],
		}),
		action.create(),
	];
}

export const productUI = defineResourceUI(productResource, {
	headerActions: ({ t }) => buildProductHeaderActions(t),
	stats: {
		columns: 4,
		build: ({ rows, total, rawResponse, t }) => {
			const stats = computeProductStats(rows, total, rawResponse?.summary);
			const totalSku = stats?.total ?? 0;
			const activeCount = stats?.activeCount ?? 0;
			const lowStockCount = stats?.lowStockCount ?? 0;
			const activeRate = totalSku > 0 ? `${Math.round((activeCount / totalSku) * 100)}%` : "0%";
			return [
				{
					id: "total",
					title: t("metric_total_title"),
					value: totalSku,
					icon: Package,
					theme: "chart-4",
					description: t("metric_total_desc"),
					sparklineData: stats?.sparklines?.totalSku,
				},
				{
					id: "active",
					title: t("metric_active_title"),
					value: activeCount,
					icon: CheckCircle2,
					theme: "chart-2",
					description: t("metric_active_desc"),
					trend: { value: activeRate, direction: "neutral", label: t("metric_active_trend") },
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
					sparklineData: stats?.sparklines?.avgPrice,
				},
			];
		},
	},
	table: productTableConfig,
	form: {
		size: "xl",
		schema: buildProductFormSchema,
	},
});

export const ProductsListView = productUI.ListView;
export const ProductsActionView = productUI.ActionView;
