"use client";

import { Clock, DollarSign, PackageCheck, ShoppingCart } from "lucide-react";

import { defineResourceUI } from "@/components/resource";
import { Badge } from "@/components/ui/badge";

import { computeOrderStats, ORDER_STATUS_OPTIONS, orderResource } from "./resource";
import { OrderDetailInfolist } from "./schema";
import { orderTableConfig } from "./table";
import type { OrderStatus } from "./types";

const STATUS_LABEL_KEY_MAP = Object.fromEntries(ORDER_STATUS_OPTIONS.map((opt) => [opt.value, opt.labelKey])) as Record<
	OrderStatus,
	(typeof ORDER_STATUS_OPTIONS)[number]["labelKey"]
>;

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
			order ? t("detail_placed_on", { date: new Date(order.createdAt).toLocaleString() }) : t("detail_sheet_desc"),
		render: ({ entity }) => <OrderDetailInfolist order={entity} />,
	},
});

export const OrdersListView = orderUI.ListView;
export const OrdersActionView = orderUI.ActionView;
