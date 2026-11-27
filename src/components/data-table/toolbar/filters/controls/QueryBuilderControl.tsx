"use client";

import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import type {
	DataTableColDef,
	DataTableColType,
	DataTableFilterItem,
	DataTableFilterOperator,
} from "../../../core/types";
import { isSystemColumn } from "../utils";
import type { MessageKeyOf } from "@/types/i18n";

export interface QueryBuilderControlProps<TData = any> {
	filterableColumns: DataTableColDef<TData>[];
	rules: DataTableFilterItem[];
	onAddRule: (field: string, operator?: DataTableFilterOperator, value?: any) => void;
	onUpdateRule: (id: string, patch: Partial<DataTableFilterItem>) => void;
	onRemoveRule: (id: string) => void;
}

export function getOperatorsForColumn(
	type?: DataTableColType,
	t?: (key: MessageKeyOf<"table">) => string,
): Array<{ value: DataTableFilterOperator; label: string }> {
	switch (type) {
		case "number":
			return [
				{ value: "equals", label: t ? t("op_equals") : "= equals" },
				{ value: "notEquals", label: t ? t("op_not_equals") : "!= not equals" },
				{ value: "greaterThan", label: t ? t("op_greater_than") : "> greater than" },
				{ value: "greaterThanOrEqual", label: t ? t("op_greater_than_or_equal") : ">= greater or equal" },
				{ value: "lessThan", label: t ? t("op_less_than") : "< less than" },
				{ value: "lessThanOrEqual", label: t ? t("op_less_than_or_equal") : "<= less or equal" },
				{ value: "isEmpty", label: t ? t("op_is_empty") : "is empty" },
				{ value: "isNotEmpty", label: t ? t("op_is_not_empty") : "is not empty" },
			];
		case "date":
		case "dateTime":
			return [
				{ value: "equals", label: t ? t("op_date_is") : "is" },
				{ value: "notEquals", label: t ? t("op_date_is_not") : "is not" },
				{ value: "greaterThan", label: t ? t("op_date_after") : "after" },
				{ value: "greaterThanOrEqual", label: t ? t("op_date_on_or_after") : "on or after" },
				{ value: "lessThan", label: t ? t("op_date_before") : "before" },
				{ value: "lessThanOrEqual", label: t ? t("op_date_on_or_before") : "on or before" },
				{ value: "isEmpty", label: t ? t("op_is_empty") : "is empty" },
				{ value: "isNotEmpty", label: t ? t("op_is_not_empty") : "is not empty" },
			];
		case "boolean":
			return [
				{ value: "equals", label: t ? t("op_equals") : "equals" },
				{ value: "isEmpty", label: t ? t("op_is_empty") : "is empty" },
				{ value: "isNotEmpty", label: t ? t("op_is_not_empty") : "is not empty" },
			];
		default:
			return [
				{ value: "contains", label: t ? t("op_contains") : "contains" },
				{ value: "notContains", label: t ? t("op_not_contains") : "doesn't contain" },
				{ value: "equals", label: t ? t("op_equals") : "equals" },
				{ value: "notEquals", label: t ? t("op_not_equals") : "doesn't equal" },
				{ value: "startsWith", label: t ? t("op_starts_with") : "starts with" },
				{ value: "endsWith", label: t ? t("op_ends_with") : "ends with" },
				{ value: "isEmpty", label: t ? t("op_is_empty") : "is empty" },
				{ value: "isNotEmpty", label: t ? t("op_is_not_empty") : "is not empty" },
			];
	}
}

export const QueryBuilderControl: React.FC<QueryBuilderControlProps> = ({
	filterableColumns,
	rules,
	onAddRule,
	onUpdateRule,
	onRemoveRule,
}) => {
	const t = useTranslations("table");

	const availableColumns = filterableColumns.filter((col) => Boolean(col.field) && !isSystemColumn(col));

	const columnByField = new Map<string, DataTableColDef<any>>();
	for (const col of availableColumns) {
		columnByField.set(col.field, col);
	}

	const handleAddClick = () => {
		if (availableColumns.length === 0) return;
		const firstCol = availableColumns[0];
		const defaultOp: DataTableFilterOperator =
			firstCol.type === "number" ||
			firstCol.type === "boolean" ||
			firstCol.type === "date" ||
			firstCol.type === "dateTime"
				? "equals"
				: "contains";
		onAddRule(firstCol.field, defaultOp, "");
	};

	return (
		<div className="flex flex-col gap-3 pt-2" data-testid="query-builder-control">
			<Separator />
			<div className="flex items-center justify-between">
				<div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
					<span>{t("query_builder_title")}</span>
					{rules.length > 0 ? (
						<Badge variant="secondary" className="bg-primary/10 text-primary h-4 px-1.5 py-0 font-mono text-[10px]">
							{rules.length}
						</Badge>
					) : null}
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="h-7 px-2 text-xs"
					onClick={handleAddClick}
					disabled={availableColumns.length === 0}
					data-testid="query-builder-add-rule-btn"
				>
					<Plus aria-hidden="true" data-icon="inline-start" />
					<span>{t("query_builder_add_condition")}</span>
				</Button>
			</div>

			{rules.length === 0 ? (
				<p className="text-muted-foreground py-1 text-xs italic">{t("query_builder_empty")}</p>
			) : (
				<div className="flex flex-col gap-2">
					{rules.map((rule) => {
						const currentCol = columnByField.get(rule.field);
						const operators = getOperatorsForColumn(currentCol?.type, t);
						const isNullCheck = rule.operator === "isEmpty" || rule.operator === "isNotEmpty";

						return (
							<div
								key={rule.id}
								className="bg-muted/30 flex flex-wrap items-center gap-2 rounded-md border p-2 sm:flex-nowrap"
								data-testid={`query-builder-rule-${rule.id}`}
							>
								{/* 1. Field Select */}
								<div className="w-[140px] shrink-0">
									<Select
										value={rule.field}
										onValueChange={(newField) => {
											const targetCol = columnByField.get(newField);
											const newOps = getOperatorsForColumn(targetCol?.type, t);
											const newOp = newOps.some((op) => op.value === rule.operator) ? rule.operator : newOps[0].value;
											onUpdateRule(rule.id, {
												field: newField,
												operator: newOp,
												value: targetCol?.type === currentCol?.type ? rule.value : "",
											});
										}}
									>
										<SelectTrigger className="bg-background h-8 text-xs" aria-label={t("aria_rule_column")}>
											<SelectValue placeholder={t("query_builder_column_placeholder")} />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{availableColumns.map((col) => (
													<SelectItem key={col.field} value={col.field} className="text-xs">
														{col.headerName || col.field}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>

								{/* 2. Operator Select */}
								<div className="w-[130px] shrink-0">
									<Select
										value={rule.operator}
										onValueChange={(newOp) =>
											onUpdateRule(rule.id, {
												operator: newOp as DataTableFilterOperator,
											})
										}
									>
										<SelectTrigger className="bg-background h-8 text-xs" aria-label={t("aria_rule_operator")}>
											<SelectValue placeholder={t("query_builder_operator_placeholder")} />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{operators.map((op) => (
													<SelectItem key={op.value} value={op.value} className="text-xs">
														{op.label}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>

								{/* 3. Value Input */}
								<div className="min-w-[120px] flex-1">
									{isNullCheck ? (
										<div className="text-muted-foreground flex h-8 items-center px-2 text-xs italic">
											{t("query_builder_no_value_needed")}
										</div>
									) : currentCol?.type === "boolean" ? (
										<Select
											value={rule.value === undefined ? "" : String(rule.value)}
											onValueChange={(val) => onUpdateRule(rule.id, { value: val === "true" })}
										>
											<SelectTrigger className="bg-background h-8 text-xs" aria-label={t("aria_rule_boolean_value")}>
												<SelectValue placeholder={t("query_builder_select_placeholder")} />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="true" className="text-xs">
														{t("op_true")}
													</SelectItem>
													<SelectItem value="false" className="text-xs">
														{t("op_false")}
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
									) : (
										<Input
											type={currentCol?.type === "number" ? "number" : "text"}
											className="bg-background h-8 text-xs"
											placeholder={t("query_builder_value_placeholder")}
											value={rule.value ?? ""}
											onChange={(e) =>
												onUpdateRule(rule.id, {
													value:
														currentCol?.type === "number"
															? e.target.value === ""
																? ""
																: Number(e.target.value)
															: e.target.value,
												})
											}
											aria-label={t("aria_rule_value")}
										/>
									)}
								</div>

								{/* 4. Delete Button */}
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
									onClick={() => onRemoveRule(rule.id)}
									aria-label={t("query_builder_remove_rule")}
									data-testid={`query-builder-remove-rule-${rule.id}`}
								>
									<Trash2 aria-hidden="true" />
								</Button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};
