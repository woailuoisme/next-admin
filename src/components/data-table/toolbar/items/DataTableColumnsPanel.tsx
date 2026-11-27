"use client";

import { useTranslations } from "next-intl";
import { Columns3 } from "lucide-react";
import { useId, useState, type ReactElement } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

import type { DataTableColDef } from "../../core/types";
import { isColumnVisible } from "../../core/utils";
import type { DataTableColumnsPanelProps } from "../types";
import { isSystemColumn } from "../filters/utils";

export type { DataTableColumnsPanelProps };

function DataTableColumnsPanelInner<TData = unknown>({
	columns,
	columnVisibility,
	onColumnVisibilityChange,
}: DataTableColumnsPanelProps<TData>) {
	const t = useTranslations("table");
	const baseId = useId();
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	const toggleableColumns: DataTableColDef<TData>[] = [];
	const filteredColumns: DataTableColDef<TData>[] = [];
	let visibleCount = 0;
	const trimmedSearch = search.trim().toLowerCase();

	for (const col of columns as DataTableColDef<TData>[]) {
		if (isSystemColumn(col)) continue;
		toggleableColumns.push(col);
		if (isColumnVisible(col, columnVisibility)) {
			visibleCount += 1;
		}
		if (!trimmedSearch || (col.headerName || col.field).toLowerCase().includes(trimmedSearch)) {
			filteredColumns.push(col);
		}
	}

	const handleToggle = (field: string, checked: boolean) => {
		onColumnVisibilityChange({
			...columnVisibility,
			[field]: checked,
		});
	};

	const handleShowAll = () => {
		const next: Record<string, boolean> = { ...columnVisibility };
		for (const col of toggleableColumns) {
			next[col.field] = true;
		}
		onColumnVisibilityChange(next);
	};

	const handleHideAll = () => {
		const next: Record<string, boolean> = { ...columnVisibility };
		for (const col of toggleableColumns) {
			next[col.field] = false;
		}
		onColumnVisibilityChange(next);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="text-muted-foreground hover:text-foreground h-8 text-xs"
				>
					<Columns3 aria-hidden="true" data-icon="inline-start" />
					<span>{t("columns_button")}</span>
					<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
						{visibleCount}/{toggleableColumns.length}
					</Badge>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-64 p-3 shadow-lg">
				<div className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<span className="text-foreground text-xs font-semibold">{t("columns_title")}</span>
						<div className="flex items-center gap-1.5">
							<Button
								type="button"
								variant="ghost"
								size="xs"
								className="text-muted-foreground hover:text-foreground px-1.5 text-[11px]"
								onClick={handleShowAll}
							>
								{t("columns_show_all")}
							</Button>
							<Separator orientation="vertical" className="h-3" />
							<Button
								type="button"
								variant="ghost"
								size="xs"
								className="text-muted-foreground hover:text-foreground px-1.5 text-[11px]"
								onClick={handleHideAll}
							>
								{t("columns_hide_all")}
							</Button>
						</div>
					</div>

					<Separator />

					{toggleableColumns.length > 6 ? (
						<Input
							type="text"
							placeholder={t("columns_search_placeholder")}
							aria-label={t("columns_search_placeholder")}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-7 w-full text-xs"
						/>
					) : null}

					<div className="flex max-h-60 flex-col gap-1.5 overflow-y-auto pr-1">
						{filteredColumns.map((col: DataTableColDef<TData>, idx: number) => {
							const isVisible = isColumnVisible(col, columnVisibility);
							const checkboxId = `${baseId}-${col.field}-${idx}`;
							return (
								<Label
									key={col.id ?? `${col.field}_${idx}`}
									htmlFor={checkboxId}
									className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-md p-1.5 text-xs font-normal transition-colors"
								>
									<span className="text-foreground truncate">{col.headerName || col.field}</span>
									<Checkbox
										id={checkboxId}
										checked={isVisible}
										onCheckedChange={(val) => handleToggle(col.field, Boolean(val))}
									/>
								</Label>
							);
						})}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export const DataTableColumnsPanel = DataTableColumnsPanelInner as <TData = unknown>(
	props: DataTableColumnsPanelProps<TData>,
) => ReactElement | null;
