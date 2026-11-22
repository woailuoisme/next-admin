"use client";

import { action } from "@/components/actions";
import { col } from "@/components/data-table/columns/col";
import type { ResourceTableSchema } from "@/components/resource";
import { en, zh } from "@/i18n";
import { createScopedTranslator } from "@/i18n/scoped";

import type { Category } from "./types";

const getTableT = createScopedTranslator("table", { zh: zh.table, en: en.table });

const PINNED_COLUMNS = {
	left: ["name"],
	right: ["__actions"],
};

export const categoryTableConfig: ResourceTableSchema<Category> = {
	pinnedColumns: PINNED_COLUMNS,
	exportFileName: "categories-catalog.csv",
	columns: ({ t }) => [
		col.text<Category>("name", t("col_name"), { width: 220, flex: 1, pinned: "left", weight: "semibold" }),
		col.text<Category>("slug", t("col_slug"), { width: 180, mono: true, copyable: true }),
		col.text<Category>("description", t("col_description"), { width: 280, flex: 1, truncate: true }),
		col.number<Category>("productCount", t("col_product_count"), { width: 160, suffix: t("unit_products") }),
	],
	rowActions: () => [action.edit(), action.delete()],
	rowActionsColumn: (t) => ({
		field: "__actions",
		headerName: t("col_actions"),
		width: 88,
		moreActionsLabel: t("col_actions"),
	}),
	batchActions: [
		action.export<Category[], Category>({
			id: "export-json",
			defaultFormat: "json",
			formats: ["json", "csv", "xlsx"],
			label: (rows) => `${getTableT()("export_json")} (${rows.length})`,
			fileName: (rows) => `categories-${rows.length}`,
		}),
	],
};
