"use client";

import { countBy, meanBy } from "es-toolkit";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import { useResourceManagement } from "@/components/data-table";

import type { Order, OrderFilters, OrderListResponse } from "../types";

import { OrderMetricsCards } from "../components/OrderMetricsCards";
import { OrdersTable } from "../components/OrdersTable";
import { orderQueries } from "../queries";
import { useTranslations } from "next-intl";

const OrderDetailsSheet = dynamic(() => import("../components/OrderDetailsSheet").then((m) => m.OrderDetailsSheet), {
  ssr: false,
});

export interface OrdersPageProps {
  search?: OrderFilters & { orderId?: string };
  onSelectOrder?: (orderId: string) => void;
}

export function OrdersPage({ search = {}, onSelectOrder }: OrdersPageProps) {
  const t = useTranslations("orders");
  // Centralized Resource Management (Query, URL state, Drawer modal)
  const { rows, total, isLoading, rawResponse, modal, handleViewOpenChange } = useResourceManagement<
    Order,
    OrderFilters,
    OrderListResponse
  >({
    search,
    queryOptions: orderQueries.list,
    modalKeys: {
      viewKey: "orderId",
    },
    onOpenView: onSelectOrder,
  });

  // Calculate order summary statistics for KPI cards (prefer server-computed global summary)
  const orderStats = useMemo(
    () => computeOrderStats(rows, total, rawResponse?.summary),
    [rawResponse?.summary, total, rows],
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("page_title")}</h1>
        <p className="text-muted-foreground mt-0.5 text-xs">{t("page_description")}</p>
      </div>

      {/* KPI StatCards */}
      <OrderMetricsCards stats={orderStats} isLoading={isLoading} />

      {/* Table Content */}
      <OrdersTable
        orders={rows}
        total={total}
        loading={isLoading}
        onViewOrder={modal.openView}
        onSelectOrder={modal.openView}
      />

      {/* Singleton Order Details Sheet */}
      <OrderDetailsSheet orderId={modal.viewId} open={modal.isViewOpen} onOpenChange={handleViewOpenChange} />
    </div>
  );
}

export function computeOrderStats(rows: Order[], total?: number, serverSummary?: OrderListResponse["summary"]) {
  if (serverSummary) {
    return serverSummary;
  }
  const totalCount = total ?? rows.length;
  const counts = countBy(rows, (o) => o.status);
  const pendingCount = (counts.pending ?? 0) + (counts.processing ?? 0);
  const deliveredCount = counts.delivered ?? 0;
  const avgOrderValue = rows.length > 0 ? meanBy(rows, (o) => o.total ?? 0) : 0;

  return {
    total: totalCount,
    pendingCount,
    deliveredCount,
    avgOrderValue,
  };
}
