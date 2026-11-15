"use client";

import { col } from "@/components/data-table/columns/col";
import { defineResourceUI } from "@/components/resource";

import { categoryResource } from "./resource";
import type { Category } from "./types";

const PINNED_COLUMNS = {
  left: ["name"],
  right: ["__actions"],
};

export const categoryUI = defineResourceUI(categoryResource, {
  table: {
    pinnedColumns: PINNED_COLUMNS,
    exportFileName: "categories-catalog.csv",
    columns: ({ t }) => [
      col.text<Category>("name", t("col_name"), {
        width: 220,
        flex: 1,
        pinned: "left",
        weight: "semibold",
      }),
      col.text<Category>("slug", t("col_slug"), {
        width: 180,
        mono: true,
        copyable: true,
      }),
      col.text<Category>("description", t("col_description"), {
        width: 280,
        flex: 1,
        truncate: true,
      }),
      col.number<Category>("productCount", t("col_product_count"), {
        width: 160,
        suffix: t("unit_products"),
      }),
    ],
    rowActions: (t) => ({
      field: "__actions",
      headerName: t("col_actions"),
      width: 80,
      moreActionsLabel: t("col_actions"),
      crud: {
        edit: true,
        delete: true,
      },
    }),
    batchActions: [
      {
        id: "export-json",
        kind: "exportJson",
        label: ({ selectedCount }) => `Export JSON (${selectedCount})`,
        exportFileName: (selectedCount) => `categories-${selectedCount}.json`,
      },
    ],
  },
  form: {
    size: "md",
    fields: [
      {
        type: "text",
        name: "name",
        labelKey: "form_name_label",
        required: true,
        placeholder: "e.g. Smart Home",
        slugTarget: "slug",
      },
      {
        type: "text",
        name: "slug",
        labelKey: "form_slug_label",
        required: true,
        placeholderKey: "form_slug_placeholder",
      },
      {
        type: "textarea",
        name: "description",
        labelKey: "form_desc_label",
        rows: 3,
        placeholderKey: "form_desc_placeholder",
      },
    ],
  },
});

export const CategoriesListView = categoryUI.ListView;
