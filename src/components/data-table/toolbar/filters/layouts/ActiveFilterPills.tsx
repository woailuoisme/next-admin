"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type {
	DataTableColDef,
	DataTableFilterDefinition,
	DataTableFilterItem,
	DataTableFilterModel,
	DataTableSelectFilterOption,
} from "../../../core/types";
import { isActiveFilterItem, resolveFilterField } from "../utils";

const DEFAULT_FILTERS: DataTableFilterDefinition[] = [];

export interface ActiveFilterPillsProps<TData = any> {
	filterModel: DataTableFilterModel;
	onFilterModelChange: (model: DataTableFilterModel) => void;
	columns: DataTableColDef<TData>[];
	filters?: DataTableFilterDefinition[];
}

export const ActiveFilterPills: React.FC<ActiveFilterPillsProps> = ({
	filterModel,
	onFilterModelChange,
	columns,
	filters = DEFAULT_FILTERS,
}) => {
	const t = useTranslations("table");

	const activeItems = (filterModel.items || []).filter(isActiveFilterItem);

	const columnByField = new Map<string, DataTableColDef<any>>();
	for (const col of columns) {
		columnByField.set(col.field, col);
	}

	const filterByField = new Map<string, DataTableFilterDefinition>();
	for (const def of filters) {
		const key = resolveFilterField(def);
		if (key) filterByField.set(key, def);
	}

	const quickFilterValues = filterModel.quickFilterValues?.filter((v) => v.trim().length > 0) || [];

	const totalActive = activeItems.length + (quickFilterValues.length > 0 ? 1 : 0);

	if (totalActive === 0) {
		return null;
	}

	const handleRemoveItem = (itemToRemove: DataTableFilterItem) => {
		onFilterModelChange({
			...filterModel,
			items: (filterModel.items || []).filter((i) => i.id !== itemToRemove.id),
		});
	};

	const handleRemoveQuickFilter = () => {
		onFilterModelChange({
			...filterModel,
			quickFilterValues: [],
		});
	};

	const handleClearAll = () => {
		onFilterModelChange({
			...filterModel,
			items: [],
			quickFilterValues: [],
		});
	};

	const getPillText = (item: DataTableFilterItem) => {
		const col = columnByField.get(item.field);
		const fieldName = col?.headerName || item.field;

		// Null check operators
		if (item.operator === "isEmpty") {
			return `${fieldName} ${t("op_is_empty")}`;
		}
		if (item.operator === "isNotEmpty") {
			return `${fieldName} ${t("op_is_not_empty")}`;
		}

		// Find preset filter if available
		const filterDef = filterByField.get(item.field);

		let displayVal = String(item.value);

		if (filterDef?.type === "select") {
			const opt = filterDef.options.find((o: DataTableSelectFilterOption) => String(o.value) === String(item.value));
			if (opt) {
				displayVal = opt.label;
			}
		} else if (filterDef?.type === "ternary" || col?.type === "boolean") {
			if (item.value === true || item.value === "true") {
				displayVal = filterDef?.type === "ternary" ? (filterDef.trueLabel ?? t("op_true")) : t("op_true");
			} else if (item.value === false || item.value === "false") {
				displayVal = filterDef?.type === "ternary" ? (filterDef.falseLabel ?? t("op_false")) : t("op_false");
			}
		}

		const operatorLabels: Record<string, string> = {
			contains: t("op_contains"),
			notContains: t("op_not_contains"),
			equals: "=",
			is: "=",
			notEquals: "!=",
			startsWith: t("op_starts_with"),
			endsWith: t("op_ends_with"),
			greaterThan: ">",
			greaterThanOrEqual: ">=",
			lessThan: "<",
			lessThanOrEqual: "<=",
		};

		const opLabel = operatorLabels[item.operator] || item.operator;
		return `${fieldName} ${opLabel} "${displayVal}"`;
	};

	return (
		<div
			className="border-border/40 bg-muted/20 flex flex-wrap items-center gap-1.5 border-b px-2.5 py-1.5 text-xs"
			data-testid="data-table-active-filters"
		>
			<span className="text-muted-foreground mr-1 text-[11px] font-medium">{t("filter_active_label")}</span>

			{/* Quick filter pill */}
			{quickFilterValues.length > 0 ? (
				<Badge
					variant="outline"
					className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
					data-testid="active-filter-pill-quick-search"
				>
					<span>{t("filter_quick_search_label", { value: quickFilterValues.join(" ") })}</span>
					<Button
						type="button"
						variant="ghost"
						size="icon-xs"
						className="hover:bg-primary/20 size-4 cursor-pointer rounded-full transition-colors"
						onClick={handleRemoveQuickFilter}
						aria-label={t("quick_filter_clear")}
					>
						<X aria-hidden="true" />
					</Button>
				</Badge>
			) : null}

			{/* Filter items pills */}
			{activeItems.map((item, idx) => {
				const fieldName = columnByField.get(item.field)?.headerName || item.field;
				return (
					<Badge
						key={item.id ?? `${item.field}_${item.operator}_${idx}`}
						variant="outline"
						className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
						data-testid={`active-filter-pill-${item.id ?? idx}`}
					>
						<span>{getPillText(item)}</span>
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							className="hover:bg-primary/20 size-4 cursor-pointer rounded-full transition-colors"
							onClick={() => handleRemoveItem(item)}
							aria-label={`${t("filter_remove_rule")} ${fieldName}`}
						>
							<X aria-hidden="true" />
						</Button>
					</Badge>
				);
			})}

			{/* Clear All button */}
			{totalActive >= 2 ? (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handleClearAll}
					className="text-muted-foreground hover:text-destructive ml-1 h-auto cursor-pointer p-0 text-xs underline underline-offset-2 transition-colors"
					data-testid="clear-all-active-filters-btn"
				>
					{t("filter_clear_all")}
				</Button>
			) : null}
		</div>
	);
};
