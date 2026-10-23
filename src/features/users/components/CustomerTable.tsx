import { useQueryClient } from "@tanstack/react-query";
import { useMemoizedFn } from "ahooks";
import { Ban, UserCheck } from "lucide-react";
import { useMemo } from "react";

import { col, type DataTableColDef, type DataTableFilterDefinition, ResourceTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useBatchMutation } from "@/hooks/useBatchMutation";

import type { Customer } from "../types";

import { toggleCustomerStatusApi } from "../api";
import { customerKeys, customerQueries } from "../queries";
import { useTranslations } from "next-intl";

const STATUS_VARIANT_MAP = {
  active: "success",
  inactive: "secondary",
  suspended: "destructive",
} as const;

const PINNED_COLUMNS: { left?: string[]; right?: string[] } = {
  left: ["avatarUrl"],
  right: ["__actions"],
};

const SLOT_PROPS = {
  toolbar: {
    exportFileName: "customers-directory.csv",
  },
} as const;

const getCustomerRowId = (c: Customer) => c.id;

export interface CustomerTableProps {
  customers?: Customer[];
  loading?: boolean;
  total?: number;
  onToggleCustomerStatus?: (customer: Customer) => void;
}

export function CustomerTable({ customers, loading, total, onToggleCustomerStatus }: CustomerTableProps) {
  const t = useTranslations("users");
  const queryClient = useQueryClient();

  const statusLabelMap = useMemo<Record<string, string>>(
    () => ({
      active: t("status_active"),
      inactive: t("status_inactive"),
      suspended: t("status_suspended"),
    }),
    [t],
  );

  const customerFilters = useMemo<DataTableFilterDefinition[]>(
    () => [
      {
        type: "select",
        field: "status",
        label: t("col_status"),
        placeholder: t("filter_status_placeholder"),
        options: [
          { label: t("status_active"), value: "active" },
          { label: t("status_inactive"), value: "inactive" },
          { label: t("status_suspended"), value: "suspended" },
        ],
      },
    ],
    [t],
  );

  const { mutateBatchAsync: suspendBatch, isPending: isSuspending } = useBatchMutation<Customer>({
    mutationFn: (customer) => toggleCustomerStatusApi(customer.id, "inactive"),
    entityName: t("entity_name"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });

  const handleToggleStatus = useMemoizedFn((row: Customer) => {
    onToggleCustomerStatus?.(row);
  });

  const columns = useMemo<DataTableColDef<Customer>[]>(
    () => [
      col.avatar<Customer>("avatarUrl", t("col_customer"), {
        width: 260,
        flex: 1,
        pinned: "left",
        name: (r) => r.name,
        subtext: (r) => r.email,
      }),
      col.text<Customer>("phone", t("col_phone"), {
        width: 190,
        copyable: true,
      }),
      col.number<Customer>("totalOrders", t("col_orders"), {
        width: 150,
        suffix: t("unit_purchases"),
      }),
      col.currency<Customer>("totalSpent", t("col_spent"), {
        width: 150,
      }),
      col.date<Customer>("createdAt", t("col_joined"), {
        width: 160,
      }),
      col.badge<Customer>("status", t("col_status"), {
        width: 130,
        dot: true,
        variantMap: STATUS_VARIANT_MAP,
        labelMap: statusLabelMap,
      }),
      col.actions<Customer>({
        field: "__actions",
        headerName: t("col_action"),
        width: 100,
        pinned: "right",
        align: "center",
        headerAlign: "center",
        quickActions: [
          {
            id: "suspend",
            label: t("action_suspend"),
            ariaLabel: t("action_suspend"),
            icon: Ban,
            destructive: true,
            tooltip: t("action_suspend_tooltip"),
            hidden: (row) => row.status !== "active",
            onClick: handleToggleStatus,
          },
          {
            id: "activate",
            label: t("action_activate"),
            ariaLabel: t("action_activate"),
            icon: UserCheck,
            tooltip: t("action_activate_tooltip"),
            hidden: (row) => row.status === "active",
            onClick: handleToggleStatus,
          },
        ],
      }),
    ],
    [handleToggleStatus, statusLabelMap, t],
  );

  const renderBatchActions = useMemoizedFn((selectedRows: Customer[], clearSelection: () => void) => (
    <div className="flex items-center gap-2">
      <Button
        variant="destructive"
        size="sm"
        className="h-7 gap-1 rounded-full text-xs"
        disabled={isSuspending}
        onClick={async () => {
          await suspendBatch(selectedRows);
          clearSelection();
        }}
      >
        <Ban className="size-3.5" />
        <span>Suspend ({selectedRows.length})</span>
      </Button>
    </div>
  ));

  return (
    <ResourceTable<Customer>
      queryOptions={!customers ? customerQueries.list : undefined}
      data={customers}
      loading={loading}
      total={total}
      columns={columns}
      getRowId={getCustomerRowId}
      checkboxSelection
      paginationMode="client"
      pinnedColumns={PINNED_COLUMNS}
      filters={customerFilters}
      slotProps={SLOT_PROPS}
      batchActions={renderBatchActions}
    />
  );
}
