"use client";

import { Ban, UserCheck } from "lucide-react";

import { col } from "@/components/data-table/columns/col";
import { defineResourceUI } from "@/components/resource";

import { customerResource } from "./resource";
import type { Customer } from "./types";

const STATUS_VARIANT_MAP = {
  active: "success",
  inactive: "secondary",
  suspended: "destructive",
} as const;

const PINNED_COLUMNS: { left?: string[]; right?: string[] } = {
  left: ["avatarUrl"],
  right: ["__actions"],
};

export const customerUI = defineResourceUI(customerResource, {
  table: {
    pinnedColumns: PINNED_COLUMNS,
    exportFileName: "customers-directory.csv",
    filters: (t) => [
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
    columns: ({ t }) => {
      const statusLabelMap = {
        active: t("status_active"),
        inactive: t("status_inactive"),
        suspended: t("status_suspended"),
      };

      return [
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
      ];
    },
    rowActions: (t) => ({
      field: "__actions",
      headerName: t("col_action"),
      width: 100,
      pinned: "right",
      align: "center",
      headerAlign: "center",
      quick: [
        {
          id: "suspend",
          permission: "edit",
          label: t("action_suspend"),
          ariaLabel: t("action_suspend"),
          icon: Ban,
          destructive: true,
          tooltip: t("action_suspend_tooltip"),
          hidden: (row) => row.status !== "active",
          onClick: (row, { runAction }) => runAction("toggleStatus", { id: row.id, status: "inactive" }),
        },
        {
          id: "activate",
          permission: "edit",
          label: t("action_activate"),
          ariaLabel: t("action_activate"),
          icon: UserCheck,
          tooltip: t("action_activate_tooltip"),
          hidden: (row) => row.status === "active",
          onClick: (row, { runAction }) => runAction("toggleStatus", { id: row.id, status: "active" }),
        },
      ],
    }),
    batchActions: [
      {
        id: "batch-suspend",
        kind: "action",
        actionKey: "toggleStatus",
        permission: "edit",
        variant: "destructive",
        icon: Ban,
        mapVars: (row) => ({ id: row.id, status: "inactive" as const }),
        label: ({ selectedCount, t }) => t("batch_suspend", { count: selectedCount }),
      },
    ],
  },
});

export const UsersListView = customerUI.ListView;
