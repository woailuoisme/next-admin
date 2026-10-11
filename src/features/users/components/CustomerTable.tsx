import { useQueryClient } from "@tanstack/react-query";
import { useMemoizedFn } from "ahooks";
import { Ban, UserCheck } from "lucide-react";
import { useMemo } from "react";

import {
  col,
  type DataTableColDef,
  type DataTableFilterDefinition,
  ResourceTable,
} from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useBatchMutation } from "@/hooks/use-batch-mutation";

import type { Customer } from "../types";

import { toggleCustomerStatusApi } from "../api";
import { customerKeys, customerQueries } from "../queries";

const STATUS_VARIANT_MAP = {
  active: "success",
  inactive: "secondary",
  suspended: "destructive",
} as const;

const CUSTOMER_FILTERS: DataTableFilterDefinition[] = [
  {
    type: "select",
    field: "status",
    label: "Status",
    placeholder: "All customer statuses",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Suspended", value: "suspended" },
    ],
  },
];

const PINNED_COLUMNS: { left?: string[]; right?: string[] } = {
  left: ["avatarUrl"],
  right: ["__actions"],
};

const SLOT_PROPS = {
  toolbar: {
    exportFileName: "customers-directory.csv",
    quickFilterPlaceholder: "Filter customers in view...",
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
  const queryClient = useQueryClient();

  const { mutateBatchAsync: suspendBatch, isPending: isSuspending } = useBatchMutation<Customer>({
    mutationFn: (customer) => toggleCustomerStatusApi(customer.id, "inactive"),
    entityName: "Customer",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });

  const handleToggleStatus = useMemoizedFn((row: Customer) => {
    onToggleCustomerStatus?.(row);
  });

  const columns = useMemo<DataTableColDef<Customer>[]>(
    () => [
      col.avatar<Customer>("avatarUrl", "Customer", {
        width: 260,
        flex: 1,
        pinned: "left",
        name: (r) => r.name,
        subtext: (r) => r.email,
      }),
      col.text<Customer>("phone", "Contact Phone", {
        width: 170,
        copyable: true,
      }),
      col.number<Customer>("totalOrders", "Lifetime Orders", {
        width: 150,
        aggregation: "sum",
        suffix: " purchases",
      }),
      col.currency<Customer>("totalSpent", "Total Spent", {
        width: 150,
        aggregation: "sum",
      }),
      col.date<Customer>("createdAt", "Joined Date", {
        width: 130,
      }),
      col.badge<Customer>("status", "Account Status", {
        width: 120,
        dot: true,
        variantMap: STATUS_VARIANT_MAP,
      }),
      col.actions<Customer>({
        field: "__actions",
        headerName: "Action",
        width: 100,
        pinned: "right",
        align: "center",
        headerAlign: "center",
        quickActions: [
          {
            id: "suspend",
            label: "Suspend",
            ariaLabel: "Suspend",
            icon: Ban,
            destructive: true,
            tooltip: "Suspend Customer",
            hidden: (row) => row.status !== "active",
            onClick: handleToggleStatus,
          },
          {
            id: "activate",
            label: "Activate",
            ariaLabel: "Activate",
            icon: UserCheck,
            tooltip: "Activate Customer",
            hidden: (row) => row.status === "active",
            onClick: handleToggleStatus,
          },
        ],
      }),
    ],
    [handleToggleStatus],
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
      filters={CUSTOMER_FILTERS}
      summaryRow
      slotProps={SLOT_PROPS}
      batchActions={renderBatchActions}
    />
  );
}
