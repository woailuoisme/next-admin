"use client";

import { useMemoizedFn } from "ahooks";

import { useResourceManagement } from "@/components/data-table";

import type { Customer, CustomerSearchParams } from "../types";

import { CustomerTable } from "../components/CustomerTable";
import { useToggleCustomerStatusMutation } from "../hooks";
import { customerQueries } from "../queries";

export interface UsersPageProps {
  search?: CustomerSearchParams;
}

export function UsersPage({ search = {} }: UsersPageProps) {
  const { mutate: toggleStatus } = useToggleCustomerStatusMutation();

  const { rows, total, isLoading } = useResourceManagement<Customer, CustomerSearchParams>({
    search,
    queryOptions: customerQueries.list,
  });

  const handleToggleStatus = useMemoizedFn((customer: Customer) => {
    toggleStatus({
      id: customer.id,
      status: customer.status === "active" ? "inactive" : "active",
    });
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Accounts</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Directory of registered shoppers, total lifetime value, and account standing.
          </p>
        </div>
      </div>

      {/* Enterprise CustomerTable */}
      <CustomerTable
        customers={rows}
        total={total}
        loading={isLoading}
        onToggleCustomerStatus={handleToggleStatus}
      />
    </div>
  );
}

export { UsersPage as CustomersPage };
