"use client";

import { Ban, UserCheck } from "lucide-react";

import { action } from "@/components/actions";
import { col } from "@/components/data-table/columns/col";
import type { ResourceTableSchema } from "@/components/resource";

import { customerResource } from "./resource";
import type { Customer } from "./types";

const STATUS_VARIANT_MAP = {
	active: "success",
	inactive: "secondary",
} as const;

const PINNED_COLUMNS: { left?: string[]; right?: string[] } = {
	left: ["avatarUrl"],
	right: ["__actions"],
};

export const customerTableConfig: ResourceTableSchema<Customer> = {
	pinnedColumns: PINNED_COLUMNS,
	exportFileName: "customers-directory.csv",
	filters: (t) => [
		{
			type: "select",
			field: "status",
			label: t("col_status"),
			placeholder: t("filter_status_placeholder"),
			options: [
				{ label: t("status_active"), value: "active" },
				{ label: t("status_inactive"), value: "inactive" },
			],
		},
	],
	columns: ({ t }) => {
		const statusLabelMap = {
			active: t("status_active"),
			inactive: t("status_inactive"),
		};

		return [
			col.avatar<Customer>("avatarUrl", t("col_customer"), {
				width: 260,
				flex: 1,
				pinned: "left",
				name: (r) => r.name,
				subtext: (r) => r.email,
			}),
			col.text<Customer>("phone", t("col_phone"), { width: 190, copyable: true }),
			col.number<Customer>("totalOrders", t("col_orders"), { width: 150, suffix: t("unit_purchases") }),
			col.currency<Customer>("totalSpent", t("col_spent"), { width: 150 }),
			col.date<Customer>("createdAt", t("col_joined"), { width: 160 }),
			col.badge<Customer>("status", t("col_status"), {
				width: 130,
				dot: true,
				variantMap: STATUS_VARIANT_MAP,
				labelMap: statusLabelMap,
			}),
		];
	},
	rowActions: ({ t }) => [
		action.resource(customerResource, "toggleStatus", {
			id: "suspend",
			permission: "edit",
			label: t("action_suspend"),
			ariaLabel: t("action_suspend"),
			icon: Ban,
			color: "destructive",
			tooltip: t("action_suspend_tooltip"),
			hidden: (row) => row.status !== "active",
			confirm: {
				color: "destructive",
				icon: Ban,
				title: t("confirm_suspend_title"),
				description: (row) => t("confirm_suspend_desc", { name: row.name }),
			},
			mapVars: (row) => ({ id: row.id, status: "inactive" as const }),
		}),
		action.resource(customerResource, "toggleStatus", {
			id: "activate",
			permission: "edit",
			label: t("action_activate"),
			ariaLabel: t("action_activate"),
			icon: UserCheck,
			color: "success",
			tooltip: t("action_activate_tooltip"),
			hidden: (row) => row.status === "active",
			confirm: {
				color: "success",
				icon: UserCheck,
				title: t("confirm_activate_title"),
				description: (row) => t("confirm_activate_desc", { name: row.name }),
			},
			mapVars: (row) => ({ id: row.id, status: "active" as const }),
		}),
	],
	rowActionsColumn: (t) => ({
		field: "__actions",
		headerName: t("col_action"),
		width: 100,
		pinned: "right",
		align: "center",
		headerAlign: "center",
	}),
	batchActions: ({ t }) => [
		action.custom<Customer[]>({
			id: "batch-suspend",
			authorize: "edit",
			variant: "destructive",
			color: "destructive",
			icon: Ban,
			label: (rows) => t("batch_suspend", { count: rows.length }),
			confirm: {
				color: "destructive",
				icon: Ban,
				title: (rows) => t("confirm_batch_suspend_title", { count: rows.length }),
				description: (rows) => t("confirm_batch_suspend_desc", { count: rows.length }),
			},
			handler: async ({ payload }) => {
				await Promise.all(
					payload.map((row) => customerResource.actions.toggleStatus.mutationFn({ id: row.id, status: "inactive" })),
				);
			},
			successMessage: (_res, { payload }) => t("batch_suspend_success", { count: payload.length }),
		}),
	],
};
