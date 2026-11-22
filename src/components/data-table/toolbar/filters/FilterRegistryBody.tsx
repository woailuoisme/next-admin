"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "cn";

import type {
	DataTableColDef,
	DataTableFilterDefinition,
	DataTableFilterItem,
	DataTableFilterOperator,
	DataTableSelectFilterOption,
} from "../../core/types";

import { isQueryBuilderRule, resolveFilterField } from "./utils";

const LazyQueryBuilderControl = dynamic(
	() => import("./controls/QueryBuilderControl").then((m) => m.QueryBuilderControl),
	{ ssr: false },
);

const GRID_COLUMN_CLASSES: Record<number, string> = {
	1: "grid-cols-1",
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
	4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
};

interface FilterSelectOptionItem {
	label: string;
	value: string;
	badge?: string | number;
}

const EMPTY_OPTIONS: FilterSelectOptionItem[] = [];

function FilterSelectField({
	value,
	placeholder,
	allLabel,
	options,
	ariaLabel,
	onChange,
}: {
	value: unknown;
	placeholder: string;
	allLabel: string;
	options: FilterSelectOptionItem[];
	ariaLabel: string;
	onChange: (val: string) => void;
}) {
	return (
		<Select value={String(value ?? "__all__")} onValueChange={onChange}>
			<SelectTrigger className="bg-background h-8 text-xs" aria-label={ariaLabel}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="__all__" className="text-muted-foreground text-xs font-medium">
					{allLabel}
				</SelectItem>
				{options.map((opt) => (
					<SelectItem key={opt.value} value={opt.value} className="text-xs">
						<div className="flex w-full items-center justify-between gap-3">
							<span>{opt.label}</span>
							{opt.badge !== undefined ? (
								<span className="bg-muted text-muted-foreground rounded-sm px-1.5 py-0.5 font-mono text-[10px]">
									{opt.badge}
								</span>
							) : null}
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export interface FilterRegistryBodyProps<TData = any> {
	resolvedFilters: DataTableFilterDefinition[];
	filterableColumns: DataTableColDef<TData>[];
	currentItems: DataTableFilterItem[];
	activeCount: number;
	columnsCount: number;
	deferFilters: boolean;
	showQueryBuilder: boolean;
	hideHeader?: boolean;
	hideFooter?: boolean;
	onSelectChange: (field: string, val: string) => void;
	onTernaryChange: (field: string, val: string) => void;
	onCustomChange: (field: string, val: any) => void;
	onAddRule: (field: string, operator?: DataTableFilterOperator, value?: any) => void;
	onUpdateRule: (id: string, patch: Partial<DataTableFilterItem>) => void;
	onRemoveRule: (id: string) => void;
	onReset: () => void;
	onClose: () => void;
	onApply: () => void;
}

export function FilterRegistryBody<TData = any>({
	resolvedFilters,
	filterableColumns,
	currentItems,
	activeCount,
	columnsCount,
	deferFilters,
	showQueryBuilder,
	hideHeader = false,
	hideFooter = false,
	onSelectChange,
	onTernaryChange,
	onCustomChange,
	onAddRule,
	onUpdateRule,
	onRemoveRule,
	onReset,
	onClose,
	onApply,
}: FilterRegistryBodyProps<TData>) {
	const t = useTranslations("table");
	const showReset = currentItems.length > 0 || activeCount > 0;

	const columnByField = new Map<string, DataTableColDef<TData>>();
	for (const col of filterableColumns) {
		columnByField.set(col.field, col);
	}

	const selectOptionsByField = new Map<string, FilterSelectOptionItem[]>();
	resolvedFilters.forEach((def, idx) => {
		const field = resolveFilterField(def, idx);
		if (def.type === "select") {
			selectOptionsByField.set(
				field,
				def.options.map((opt: DataTableSelectFilterOption) => ({
					label: opt.label,
					value: String(opt.value),
					badge: opt.badge,
				})),
			);
		} else if (def.type === "ternary") {
			selectOptionsByField.set(field, [
				{ label: def.trueLabel ?? t("op_true"), value: "true" },
				{ label: def.falseLabel ?? t("op_false"), value: "false" },
			]);
		}
	});

	const presetItemByField = new Map<string, DataTableFilterItem>();
	const queryBuilderRules: DataTableFilterItem[] = [];
	for (const item of currentItems) {
		if (isQueryBuilderRule(item)) {
			queryBuilderRules.push(item);
		} else if (item.operator === "equals" || !presetItemByField.has(item.field)) {
			presetItemByField.set(item.field, item);
		}
	}

	return (
		<div data-testid="data-table-filter-panel" className="space-y-4">
			{!hideHeader ? (
				<div className="flex items-center justify-between border-b pb-2.5">
					<div className="flex items-center gap-2">
						<span className="text-foreground text-xs font-semibold sm:text-sm">{t("filter_title")}</span>
						{activeCount > 0 ? (
							<Badge variant="secondary" className="bg-primary/10 text-primary font-mono text-[10px]">
								{t("filter_active_count", { count: activeCount })}
							</Badge>
						) : null}
					</div>

					{showReset ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={onReset}
							className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-6 px-2 text-xs"
						>
							{t("filter_reset")}
						</Button>
					) : null}
				</div>
			) : null}

			{resolvedFilters.length === 0 ? (
				<p className="text-muted-foreground py-4 text-center text-xs">{t("filter_empty")}</p>
			) : (
				<div className={cn("grid gap-3.5", GRID_COLUMN_CLASSES[columnsCount] ?? GRID_COLUMN_CLASSES[2])}>
					{resolvedFilters.map((def, idx) => {
						const filterField = resolveFilterField(def, idx);
						const col = columnByField.get(filterField);
						const labelText = def.label ?? col?.headerName ?? filterField;
						const activeItem = presetItemByField.get(filterField);

						if (def.type === "select" || def.type === "ternary") {
							const allLabel = def.type === "select" ? t("filter_all_option") : "-";
							return (
								<div key={filterField} className="space-y-1.5">
									<Label className="text-foreground text-xs font-medium">{labelText}</Label>
									<FilterSelectField
										value={activeItem?.operator === "equals" ? activeItem.value : undefined}
										placeholder={def.placeholder ?? allLabel}
										allLabel={allLabel}
										options={selectOptionsByField.get(filterField) ?? EMPTY_OPTIONS}
										ariaLabel={labelText}
										onChange={(val) =>
											def.type === "select" ? onSelectChange(filterField, val) : onTernaryChange(filterField, val)
										}
									/>
								</div>
							);
						}

						if (def.type === "custom") {
							return (
								<div key={filterField} className="space-y-1.5">
									<Label className="text-foreground text-xs font-medium">{labelText}</Label>
									{def.render({
										value: activeItem?.value,
										onChange: (val) => onCustomChange(filterField, val),
									})}
								</div>
							);
						}

						return null;
					})}
				</div>
			)}

			{showQueryBuilder ? (
				<LazyQueryBuilderControl
					filterableColumns={filterableColumns}
					rules={queryBuilderRules}
					onAddRule={onAddRule}
					onUpdateRule={onUpdateRule}
					onRemoveRule={onRemoveRule}
				/>
			) : null}

			{!hideFooter ? (
				<div className="flex items-center justify-end gap-2 border-t pt-3">
					<Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
						{t("filter_close")}
					</Button>
					<Button type="button" size="sm" onClick={onApply} className="h-8 px-4 text-xs font-medium">
						{deferFilters ? t("filter_apply") : t("filter_done")}
					</Button>
				</div>
			) : null}
		</div>
	);
}
