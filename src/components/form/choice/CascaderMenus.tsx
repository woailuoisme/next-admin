"use client";

import { Check, ChevronRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "cn";

import { HighlightedText } from "./HighlightedText";
import {
	getCascaderOptionChildren,
	getCascaderOptionLabel,
	getCascaderOptionValue,
	type CascaderFieldNames,
	type CascaderOption,
	type CascaderSearchResultItem,
} from "./treeEngine";

function CascaderColumnOptionRow({
	option,
	columnIndex,
	fieldNames,
	isActive,
	isFinalLeaf,
	isLoading,
	hasSubMenu,
	onClickOption,
	onMouseEnterOption,
}: {
	option: CascaderOption;
	columnIndex: number;
	fieldNames: Required<CascaderFieldNames>;
	isActive: boolean;
	isFinalLeaf: boolean;
	isLoading: boolean;
	hasSubMenu: boolean;
	onClickOption: (option: CascaderOption, columnIndex: number) => void;
	onMouseEnterOption: (option: CascaderOption, columnIndex: number) => void;
}) {
	const optLabel = getCascaderOptionLabel(option, fieldNames);

	return (
		<Button
			type="button"
			variant="ghost"
			size="xs"
			role="menuitem"
			disabled={Boolean(option.disabled)}
			title={option.title ?? (typeof option.label === "string" ? option.label : optLabel)}
			onClick={() => onClickOption(option, columnIndex)}
			onMouseEnter={() => onMouseEnterOption(option, columnIndex)}
			className={cn(
				"relative flex h-auto w-full cursor-pointer items-center justify-between gap-1.5 rounded-md px-2.5 py-1.5 text-left text-xs font-normal shadow-none select-none transition-colors outline-hidden",
				"hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
				isActive && "bg-accent/80 text-accent-foreground font-medium",
				option.disabled && "pointer-events-none opacity-50",
			)}
		>
			<div className="flex min-w-0 items-center gap-1.5">
				{option.icon && <span className="size-3.5 shrink-0">{option.icon}</span>}
				<span className="truncate">{option.label ?? optLabel}</span>
			</div>

			<div className="flex shrink-0 items-center gap-1">
				{isLoading ? (
					<Loader2 aria-hidden="true" className="text-muted-foreground size-3.5 animate-spin" />
				) : hasSubMenu ? (
					<ChevronRight aria-hidden="true" className="text-muted-foreground size-3.5 opacity-60" />
				) : isFinalLeaf ? (
					<Check aria-hidden="true" className="text-primary size-3.5" />
				) : null}
			</div>
		</Button>
	);
}

export function CascaderSearchResults({
	searchResults,
	searchQuery,
	currentValue,
	separator,
	emptyText,
	onSelectPath,
}: {
	searchResults: CascaderSearchResultItem[];
	searchQuery: string;
	currentValue: (string | number)[];
	separator: string;
	emptyText: string;
	onSelectPath: (path: CascaderOption[], shouldClose: boolean) => void;
}) {
	return (
		<div className="no-scrollbar max-h-64 min-w-[280px] overflow-y-auto p-1 text-sm">
			{searchResults.length === 0 ? (
				<div className="text-muted-foreground flex h-24 items-center justify-center text-xs">{emptyText}</div>
			) : (
				searchResults.map((item, idx) => {
					const isSelected =
						item.values.length === currentValue.length &&
						item.values.every((v, i) => String(v) === String(currentValue[i]));

					return (
						<Button
							key={item.values.join("-") || idx}
							type="button"
							variant="ghost"
							size="xs"
							disabled={item.disabled}
							onClick={() => onSelectPath(item.path, true)}
							className={cn(
								"flex h-auto w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-normal shadow-none transition-colors",
								"hover:bg-accent hover:text-accent-foreground",
								isSelected && "bg-accent/70 text-accent-foreground font-medium",
								item.disabled && "pointer-events-none opacity-50",
							)}
						>
							<span className="truncate">
								<HighlightedText text={item.labels.join(separator)} keyword={searchQuery} variant="inline" />
							</span>
							{isSelected && <Check aria-hidden="true" className="text-primary size-3.5 shrink-0" />}
						</Button>
					);
				})
			)}
		</div>
	);
}

export function CascaderColumnMenus({
	columns,
	activePath,
	currentValue,
	fieldNames,
	loadingMap,
	emptyText,
	onClickOption,
	onMouseEnterOption,
}: {
	columns: CascaderOption[][];
	activePath: CascaderOption[];
	currentValue: (string | number)[];
	fieldNames: Required<CascaderFieldNames>;
	loadingMap: Record<string, boolean>;
	emptyText: string;
	onClickOption: (option: CascaderOption, columnIndex: number) => void;
	onMouseEnterOption: (option: CascaderOption, columnIndex: number) => void;
}) {
	return (
		<div className="divide-border flex divide-x">
			{columns.map((columnOptions, colIndex) => {
				const activeOptionInCol = activePath[colIndex];

				return (
					<div
						key={colIndex}
						role="menu"
						className="no-scrollbar h-64 max-w-[200px] min-w-[130px] overflow-y-auto p-1 text-sm"
					>
						{columnOptions.length === 0 ? (
							<div className="text-muted-foreground flex h-full items-center justify-center text-xs">{emptyText}</div>
						) : (
							columnOptions.map((opt) => {
								const optVal = getCascaderOptionValue(opt, fieldNames);
								const optChildren = getCascaderOptionChildren(opt, fieldNames);

								const isActive = Boolean(
									activeOptionInCol && String(getCascaderOptionValue(activeOptionInCol, fieldNames)) === String(optVal),
								);
								const isSelectedInFinal =
									currentValue.length > colIndex && String(currentValue[colIndex]) === String(optVal);
								const isFinalLeaf = Boolean(
									isSelectedInFinal &&
									(opt.isLeaf === true ||
										(!optChildren && opt.isLeaf !== false) ||
										currentValue.length === colIndex + 1),
								);

								return (
									<CascaderColumnOptionRow
										key={String(optVal)}
										option={opt}
										columnIndex={colIndex}
										fieldNames={fieldNames}
										isActive={isActive}
										isFinalLeaf={isFinalLeaf}
										isLoading={Boolean(opt.loading || loadingMap[String(optVal)])}
										hasSubMenu={Boolean((optChildren && optChildren.length > 0) || opt.isLeaf === false)}
										onClickOption={onClickOption}
										onMouseEnterOption={onMouseEnterOption}
									/>
								);
							})
						)}
					</div>
				);
			})}
		</div>
	);
}
