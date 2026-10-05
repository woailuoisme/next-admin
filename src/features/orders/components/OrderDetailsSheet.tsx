import { useQuery } from "@tanstack/react-query";
import { useMemoizedFn } from "ahooks";
import { Clock, Loader2 } from "lucide-react";

import { DataList, ViewDialog } from "@/components/dialogs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import type { OrderStatus } from "../types";

import { useUpdateOrderStatusMutation } from "../hooks";
import { orderQueries } from "../queries";
import { ORDER_STATUS_OPTIONS } from "../schemas";

interface OrderDetailsSheetProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsSheet({ orderId, open, onOpenChange }: OrderDetailsSheetProps) {
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
        order
          ? `Placed on ${new Date(order.createdAt).toLocaleString()}`
          : "Order details and fulfillment tracking"
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
              Fulfillment Progress
            </Label>
            <Select
              value={order.status}
              onValueChange={(val) => handleStatusChange(val as OrderStatus)}
              disabled={statusMutation.isPending}
            >
              <SelectTrigger className="h-8 w-full text-xs font-medium capitalize">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUS_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {statusMutation.isPending && (
              <p className="text-muted-foreground flex items-center gap-1 text-[10px]">
                <Loader2 className="size-3 animate-spin" /> Updating fulfillment state...
              </p>
            )}
          </div>

          {/* Customer Details via DataList */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
              Customer Information
            </p>
            <DataList
              items={[
                { label: "Full Name", value: order.customerName },
                {
                  label: "Email Address",
                  value: order.customerEmail,
                  copyable: true,
                },
                { label: "Shipping Destination", value: order.shippingAddress },
              ]}
              columns={1}
            />
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
              Purchased Line Items
            </p>
            <div className="divide-border/50 border-border/60 bg-card divide-y overflow-hidden rounded-lg border">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between p-3">
                  <div className="space-y-0.5">
                    <p className="text-foreground text-xs font-medium">{item.productTitle}</p>
                    <p className="text-muted-foreground text-[11px]">
                      Qty: {item.quantity} &times; ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-foreground text-xs font-semibold">
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals */}
          <div className="border-border/60 bg-muted/10 space-y-1.5 rounded-lg border p-3">
            <div className="text-muted-foreground flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Standard Shipping</span>
              <span>${order.shipping.toFixed(2)}</span>
            </div>
            <Separator className="my-1" />
            <div className="text-foreground flex justify-between pt-1 text-sm font-bold">
              <span>Total Billed</span>
              <span className="text-primary font-mono">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </ViewDialog>
  );
}
