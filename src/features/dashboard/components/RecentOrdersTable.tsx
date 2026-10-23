import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";

import type { Order, OrderStatus } from "@/features/orders";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MessageKeyOf } from "@/types/i18n";
import { useFormatter, useTranslations } from "next-intl";

interface RecentOrdersTableProps {
  orders?: Order[];
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    labelKey: MessageKeyOf<"orders">;
    className?: string;
    variant?: "destructive";
  }
> = {
  delivered: {
    labelKey: "status_delivered",
    className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium",
  },
  shipped: {
    labelKey: "status_shipped",
    className: "border-primary/30 bg-primary/10 text-primary font-medium",
  },
  processing: {
    labelKey: "status_processing",
    className: "border-foreground/15 bg-secondary text-secondary-foreground font-medium",
  },
  pending: {
    labelKey: "status_pending",
    className: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium",
  },
  cancelled: {
    labelKey: "status_cancelled",
    variant: "destructive",
    className: "font-medium",
  },
};

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("orders");
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <Badge variant={config.variant} className={config.className}>
      {t(config.labelKey)}
    </Badge>
  );
}

export function RecentOrdersTable({ orders = [], isLoading = false }: RecentOrdersTableProps) {
  const t = useTranslations("dashboard");
  const format = useFormatter();
  const formatOrderTotal = (val: number) => format.number(val, { style: "currency", currency: "USD" });

  if (isLoading) {
    return (
      <Card className="border-border/60 col-span-full shadow-xs lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-56" />
          </div>
          <Skeleton className="h-8 w-16" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-border/50 divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`recent-orders-skeleton-${i}`} className="flex items-center justify-between p-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-14 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-28" />
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="ml-auto h-4 w-14" />
                  <Skeleton className="ml-auto h-3 w-10" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 col-span-full shadow-xs lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ShoppingCart className="text-primary size-4" />
            {t("recent_orders_title")}
          </CardTitle>
          <CardDescription className="text-xs">{t("recent_orders_desc")}</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
          <Link href="/orders">
            {t("recent_orders_view_all")} <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-border/50 divide-y">
          {orders.map((order) => (
            <div key={order.id} className="hover:bg-muted/40 flex items-center justify-between p-4 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold tracking-tight">{order.orderNumber}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-muted-foreground text-xs">{order.customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold">{formatOrderTotal(order.total)}</p>
                <p className="text-muted-foreground text-[11px]">
                  {t("recent_orders_items", { count: order.items.length })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
