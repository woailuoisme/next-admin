"use client";

import { action } from "@/components/actions";
import { BadgeCell } from "@/components/data-table/cells/display/BadgeCell";
import { col } from "@/components/data-table/columns/col";
import type { DataTableRenderCellParams } from "@/components/data-table/core";
import type { ResourceTableSchema } from "@/components/resource";
import { cn } from "cn";

import { buildProductStatusMap, buildProductStatusOptions, LOW_STOCK_THRESHOLD } from "./resource";
import type { Product } from "./types";

const STATUS_VARIANT_MAP: Record<string, "success" | "secondary" | "warning"> = {
	active: "success",
	draft: "secondary",
	out_of_stock: "warning",
};

const PINNED_COLUMNS = Object.freeze({
	left: ["imageUrl", "title"],
	right: ["actions"],
});

export const productTableConfig: ResourceTableSchema<Product> = {
	pinnedColumns: PINNED_COLUMNS,
	exportFileName: "products-catalog.csv",
	filters: (t) => [
		{
			type: "select",
			field: "status",
			label: t("col_status"),
			placeholder: t("filter_status_placeholder"),
			options: buildProductStatusOptions(t),
		},
		{
			type: "select",
			field: "categoryId",
			label: t("col_category"),
			placeholder: t("filter_category_placeholder"),
			options: [
				{ label: t("category_electronics"), value: "cat-1" },
				{ label: t("category_accessories"), value: "cat-2" },
				{ label: t("category_clothing"), value: "cat-3" },
				{ label: t("category_home"), value: "cat-4" },
			],
		},
	],
	columns: ({ t }) => {
		const statusLabelMap = buildProductStatusMap(t);
		return [
			col.avatar<Product>("imageUrl", t("col_item"), { width: 70, pinned: "left", shape: "rounded", size: "md" }),
			col.text<Product>("title", t("col_product_info"), {
				description: (r) => r.slug,
				copyable: (r) => r.slug,
				flex: 1,
				width: 260,
				pinned: "left",
				weight: "semibold",
			}),
			col.badge<Product>("categoryName", t("col_category"), { width: 140, variant: "outline" }),
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
								<span className={cn("font-medium", margin < 0 ? "text-destructive" : "text-chart-2")}>
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
					if (row.stock === 0) return <BadgeCell value={t("stock_out")} variant="destructive" />;
					if (row.stock <= LOW_STOCK_THRESHOLD)
						return <BadgeCell value={t("low_stock", { count: row.stock })} variant="warning" dot />;
					return <span className="text-muted-foreground font-mono text-xs">{t("in_stock", { count: row.stock })}</span>;
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
	rowActions: ({ t }) => [
		action.edit(),
		action.group(
			[
				action.replicate<Product>({
					label: t("action_replicate"),
					mutateClone: (clone, original) => ({
						...clone,
						title: `${original.title} (Copy)`,
						slug: `${original.slug}-copy-${Date.now().toString(36).slice(-4)}`,
					}),
					successMessage: (_res, { payload }) => t("replicate_success", { name: payload.title }),
				}),
				action.delete({ separator: true }),
			],
			{ id: "product-more-actions", layout: "dropdown" },
		),
	],
	rowActionsColumn: (t) => ({
		field: "actions",
		headerName: t("col_actions"),
		width: 96,
		moreActionsLabel: t("col_actions"),
	}),
	batchActions: ({ t }) => [
		action.export<Product[], Product>({
			id: "batch-export",
			label: (rows) => t("batch_export", { count: rows.length }),
			fileName: (rows) => `products-selected-${rows.length}`,
		}),
		action.batchDelete<Product>({
			id: "batch-delete",
			label: (rows) => t("batch_delete", { count: rows.length }),
		}),
	],
};
