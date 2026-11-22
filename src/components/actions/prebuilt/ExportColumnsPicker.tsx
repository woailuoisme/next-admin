"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import type { ExportColumnOption } from "../types";

export function inferExportColumnsFromRows<TItem>(rows: TItem[]): ExportColumnOption<TItem>[] {
	const first = rows[0];
	if (!first || typeof first !== "object") return [];
	return Object.keys(first)
		.filter((key) => !key.startsWith("__"))
		.map((key) => ({ field: key, headerName: key, defaultSelected: true }));
}

interface ExportColumnsPickerProps<TItem> {
	columns: ExportColumnOption<TItem>[];
	selectedFields: string[];
	isExporting: boolean;
	onSelectAll: () => void;
	onDeselectAll: () => void;
	onToggleField: (field: string, checked: boolean) => void;
}

export function ExportColumnsPicker<TItem>({
	columns,
	selectedFields,
	isExporting,
	onSelectAll,
	onDeselectAll,
	onToggleField,
}: ExportColumnsPickerProps<TItem>) {
	const t = useTranslations("actions");

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<Label className="text-xs font-medium">{t("export_columns")}</Label>
				<div className="flex items-center gap-2">
					<Button type="button" variant="ghost" size="xs" className="h-6 px-2 text-xs" onClick={onSelectAll}>
						{t("export_select_all")}
					</Button>
					<Button type="button" variant="ghost" size="xs" className="h-6 px-2 text-xs" onClick={onDeselectAll}>
						{t("export_deselect_all")}
					</Button>
				</div>
			</div>

			<div className="border-border/70 bg-muted/20 grid max-h-52 grid-cols-2 gap-2 overflow-y-auto rounded-lg border p-3">
				{columns.map((col) => (
					<label
						key={col.field}
						className="hover:bg-accent/50 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs"
					>
						<Checkbox
							checked={selectedFields.includes(col.field)}
							onCheckedChange={(val) => onToggleField(col.field, Boolean(val))}
							disabled={isExporting}
						/>
						<span className="truncate">{col.headerName}</span>
					</label>
				))}
			</div>
		</div>
	);
}
