import { useQuery } from "@tanstack/react-query";
import { useMemoizedFn } from "ahooks";
import { Clock, Loader2 } from "lucide-react";

import { DataList, ViewDialog } from "@/components/dialogs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import type { OrderStatus } from "../types";

import { useUpdateOrderStatusMutation } from "../hooks";
import { orderQueries } from "../queries";
import { ORDER_STATUS_OPTIONS } from "../schemas";
import { useTranslations } from "next-intl";

interface OrderDetailsSheetProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsSheet({ orderId, open, onOpenChange }: OrderDetailsSheetProps) {
  const t = useTranslations("orders");
  const { data: order, isLoading } = useQuery({
    ...orderQueries.detail(orderId ?? ""),
    enabled: Boolean(orderId && open),
  });
  const statusMutation = useUpdateOrderStatusMutation();

  const handleStatusChange = useMemoizedFn(async (newStatus: OrderStatus) => {
    if (order) {
      await statusMutation.mutateAsync({ id: order.id, status: newStatus });
    }
  });

  if (!open && !orderId) return null;

  return (
    <ViewDialog
      variant="sheet"
      open={open}
      onOpenChange={onOpenChange}
      title={order?.orderNumber ?? "Order Details"}
      description={
        order ? `Placed on ${new Date(order.createdAt).toLocaleString()}` : "Order details and fulfillment tracking"
      }
      badge={
        order && (
          <Badge variant="outline" className="text-xs font-semibold capitalize">
            {order.status}
          </Badge>
        )
      }
      loading={isLoading || !order}
      widthClassName="sm:max-w-md"
    >
      {order && (
        <div className="space-y-5 text-xs">
          {/* Status Transition Control */}
          <div className="border-border/70 bg-muted/20 space-y-2 rounded-xl border p-3">
            <Label className="flex items-center gap-1.5 text-xs font-semibold">
              <Clock className="text-primary size-3.5" />
              {t("detail_fulfillment")}
            </Label>
            <Select
              value={order.status}
              onValueChange={(val) => handleStatusChange(val as OrderStatus)}
              disabled={statusMutation.isPending}
            >
              <SelectTrigger className="h-8 w-full text-xs font-medium capitalize">
                <SelectValue placeholder={t("update_status")} />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUS_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {t(item.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {statusMutation.isPending && (
              <p className="text-muted-foreground flex items-center gap-1 text-[10px]">
                <Loader2 className="size-3 animate-spin" /> {t("detail_updating")}
              </p>
            )}
          </div>

          {/* Customer Details via DataList */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
              {t("detail_customer_info")}
            </p>
            <DataList
              items={[
                { label: t("detail_full_name"), value: order.customerName },
                {
                  label: t("detail_email"),
                  value: order.customerEmail,
                  copyable: true,
                },
                { label: t("detail_shipping_destination"), value: order.shippingAddress },
              ]}
              columns={1}
            />
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
              {t("detail_line_items")}
            </p>
            <div className="divide-border/50 border-border/60 bg-card divide-y overflow-hidden rounded-lg border">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between p-3">
                  <div className="space-y-0.5">
                    <p className="text-foreground text-xs font-medium">{item.productTitle}</p>
                    <p className="text-muted-foreground text-[11px]">
                      {t("detail_qty", { count: item.quantity })} ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-foreground text-xs font-semibold">${(item.quantity * item.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals */}
          <div className="border-border/60 bg-muted/10 space-y-1.5 rounded-lg border p-3">
            <div className="text-muted-foreground flex justify-between">
              <span>{t("detail_subtotal")}</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>{t("detail_tax")}</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>{t("detail_shipping")}</span>
              <span>${order.shipping.toFixed(2)}</span>
            </div>
            <Separator className="my-1" />
            <div className="text-foreground flex justify-between pt-1 text-sm font-bold">
              <span>{t("detail_total_billed")}</span>
              <span className="text-primary font-mono">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </ViewDialog>
  );
}
