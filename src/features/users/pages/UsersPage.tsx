"use client";

import { useMemoizedFn } from "ahooks";

import { useResourceManagement } from "@/components/data-table/hooks/useResourceManagement";

import type { Customer, CustomerSearchParams } from "../types";

import { CustomerTable } from "../components/CustomerTable";
import { useToggleCustomerStatusMutation } from "../hooks";
import { customerQueries } from "../queries";
import { useTranslations } from "next-intl";

export interface UsersPageProps {
  search?: CustomerSearchParams;
}

export function UsersPage({ search }: UsersPageProps) {
  const t = useTranslations("users");
  const { mutate: toggleStatus } = useToggleCustomerStatusMutation();

  const { state } = useResourceManagement<Customer, CustomerSearchParams>({
    search,
    queryOptions: customerQueries.list,
    paginationMode: "client",
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
          <h1 className="text-2xl font-bold tracking-tight">{t("page_heading")}</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">{t("page_heading_desc")}</p>
        </div>
      </div>

      {/* Enterprise CustomerTable */}
      <CustomerTable state={state} onToggleCustomerStatus={handleToggleStatus} />
    </div>
  );
}

export { UsersPage as CustomersPage };
