"use client";

import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

import { ActionSelectEntry, RepeatableEntry, SummaryEntry } from "@/components/infolist/entries";
import { s, SchemaRenderer, type SchemaNode } from "@/components/schema";
import { useResourceAction } from "@/lib/resource";

import { ORDER_STATUS_OPTIONS, orderResource } from "./resource";
import type { Order, OrderItem, OrderStatus } from "./types";

export function OrderDetailInfolist({ order }: { order: Order | null }) {
	const t = useTranslations("orders");
	const statusMutation = useResourceAction(orderResource, "updateStatus");
	const statusOptions = ORDER_STATUS_OPTIONS.map((item) => ({ value: item.value, label: t(item.labelKey) }));

	if (!order) return null;

	const orderSchema: SchemaNode<Order>[] = [
		s.custom<Order>({
			key: "fulfillment-status",
			render: ({ record }) =>
				record ? (
					<ActionSelectEntry<OrderStatus>
						label={t("detail_fulfillment")}
						icon={Clock}
						value={record.status}
						options={statusOptions}
						placeholder={t("update_status")}
						isPending={statusMutation.isPending}
						pendingText={t("detail_updating")}
						onChange={async (status) => {
							await statusMutation.mutateAsync({ id: record.id, status });
						}}
					/>
				) : null,
		}),
		s.section<Order>({
			titleKey: "detail_customer_info",
			columns: 1,
			card: true,
			schema: [
				s.entry.text("customerName", { labelKey: "detail_full_name" }),
				s.entry.text("customerEmail", {
					labelKey: "detail_email",
					copyable: true,
					href: order.customerEmail ? `mailto:${order.customerEmail}` : undefined,
				}),
				s.entry.text("shippingAddress", { labelKey: "detail_shipping_destination" }),
			],
		}),
		s.section<Order>({
			titleKey: "detail_line_items",
			columns: 1,
			schema: [
				s.custom<Order>({
					key: "order-items",
					render: () => (
						<RepeatableEntry<OrderItem>
							name="items"
							variant="card"
							keyExtractor={(item, idx) => `${item.productId}-${idx}`}
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
					),
				}),
			],
		}),
		s.custom<Order>({
			key: "order-summary",
			render: ({ record }) =>
				record ? (
					<SummaryEntry
						items={[
							{ label: t("detail_subtotal"), value: record.subtotal },
							{ label: t("detail_tax"), value: record.tax },
							{ label: t("detail_shipping"), value: record.shipping },
						]}
						total={{ label: t("detail_total_billed"), value: record.total }}
					/>
				) : null,
		}),
	];

	return (
		<SchemaRenderer
			i18nNamespace="orders"
			schema={orderSchema}
			record={order}
			dense
			mode="view"
			className="gap-5 text-xs"
		/>
	);
}
