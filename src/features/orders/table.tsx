"use client";

import { sumBy } from "es-toolkit";
import { Printer } from "lucide-react";

import { action } from "@/components/actions";
import { col } from "@/components/data-table/columns/col";
import type { ResourceTableSchema } from "@/components/resource";

import { ORDER_STATUS_OPTIONS } from "./resource";
import type { Order } from "./types";

const STATUS_VARIANT_MAP = {
	delivered: "success",
	shipped: "info",
	processing: "secondary",
	pending: "warning",
	cancelled: "destructive",
} as const;

export const ORDER_PINNED_COLUMNS = Object.freeze({
	left: ["orderNumber", "customerName"],
	right: ["actions"],
});

const getItemsQuantity = (row: Order) => sumBy(row.items, (item) => item.quantity);

export const orderTableConfig: ResourceTableSchema<Order> = {
	pinnedColumns: ORDER_PINNED_COLUMNS,
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
			col.text<Order>("orderNumber", t("col_order_number"), { mono: true, copyable: true, width: 150, pinned: "left" }),
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
	rowActions: ({ t }) => [action.view({ label: t("action_inspect") })],
	rowActionsColumn: (t) => ({ field: "actions", headerName: t("col_details"), width: 80 }),
	batchActions: ({ t }) => [
		action.export<Order[], Order>({
			id: "export-json",
			defaultFormat: "json",
			formats: ["json", "csv", "xlsx"],
			label: (rows) => t("export_json", { count: rows.length }),
			fileName: (rows) => `selected-orders-${rows.length}`,
		}),
		action.custom<Order[]>({
			id: "print-selected",
			icon: Printer,
			label: () => t("print_selected"),
			handler: () => window.print(),
		}),
	],
};
