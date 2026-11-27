"use client";

import { Clock, DollarSign, PackageCheck, ShoppingCart } from "lucide-react";

import { defineResourceUI } from "@/components/resource";
import { Badge } from "@/components/ui/badge";
import { getLocale } from "@/i18n/config";

import { computeOrderStats, ORDER_STATUS_OPTIONS, orderResource } from "./resource";
import { OrderDetailInfolist } from "./schema";
import { orderTableConfig } from "./table";
import type { OrderStatus } from "./types";

const STATUS_LABEL_KEY_MAP = Object.fromEntries(ORDER_STATUS_OPTIONS.map((opt) => [opt.value, opt.labelKey])) as Record<
	OrderStatus,
	(typeof ORDER_STATUS_OPTIONS)[number]["labelKey"]
>;

function formatOrderDateTime(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return date.toLocaleString(getLocale() === "en" ? "en-US" : "zh-CN");
}

export const orderUI = defineResourceUI(orderResource, {
	stats: {
		columns: 4,
		sparklineLayout: "inline",
		build: ({ rows, total, rawResponse, t }) => {
			const stats = computeOrderStats(rows, total, rawResponse?.summary);
			const totalOrders = stats?.total ?? 0;
			const pendingCount = stats?.pendingCount ?? 0;
			const deliveredCount = stats?.deliveredCount ?? 0;
			const deliveredRate = totalOrders > 0 ? `${Math.round((deliveredCount / totalOrders) * 100)}%` : "0%";
			return [
				{
					id: "total",
					title: t("metric_total_title"),
					value: totalOrders,
					icon: ShoppingCart,
					theme: "chart-1",
					description: t("metric_total_desc"),
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
					value: deliveredCount,
					icon: PackageCheck,
					theme: "chart-2",
					description: t("metric_delivered_desc"),
					trend: { value: deliveredRate, direction: "neutral", label: t("metric_delivered_trend") },
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
					sparklineData: stats?.sparklines?.avgOrderValue,
				},
			];
		},
	},
	table: orderTableConfig,
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
			order ? t("detail_placed_on", { date: formatOrderDateTime(order.createdAt) }) : t("detail_sheet_desc"),
		render: ({ entity }) => <OrderDetailInfolist order={entity} />,
	},
});

export const OrdersListView = orderUI.ListView;
export const OrdersActionView = orderUI.ActionView;
