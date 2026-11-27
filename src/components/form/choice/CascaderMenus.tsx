"use client";

import { Check, ChevronRight } from "lucide-react";
import type { KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "cn";

import { HighlightedText } from "./HighlightedText";
import {
	getCascaderOptionChildren,
	getCascaderOptionDisplayNode,
	getCascaderOptionLabel,
	getCascaderOptionValue,
	type CascaderFieldNames,
	type CascaderOption,
	type CascaderSearchResultItem,
} from "./treeEngine";
import { buildCascaderLoadingKey } from "./useCascaderState";

function moveFocusByStep(items: HTMLElement[], current: HTMLElement, step: number) {
	const enabled = items.filter((el) => !el.hasAttribute("disabled"));
	if (enabled.length === 0) return;
	const idx = enabled.indexOf(current);
	const nextIdx = idx === -1 ? (step > 0 ? 0 : enabled.length - 1) : (idx + step + enabled.length) % enabled.length;
	enabled[nextIdx]?.focus();
}

function handleListboxKeyDown(e: KeyboardEvent<HTMLDivElement>, selector: string) {
	const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(selector));
	const enabled = items.filter((el) => !el.hasAttribute("disabled"));
	if (enabled.length === 0) return;
	const active = document.activeElement as HTMLElement;

	if (e.key === "ArrowDown") {
		e.preventDefault();
		moveFocusByStep(items, active, 1);
	} else if (e.key === "ArrowUp") {
		e.preventDefault();
		moveFocusByStep(items, active, -1);
	} else if (e.key === "Home") {
		e.preventDefault();
		enabled[0]?.focus();
	} else if (e.key === "End") {
		e.preventDefault();
		enabled[enabled.length - 1]?.focus();
	}
}

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
	const optDisplay = getCascaderOptionDisplayNode(option, fieldNames);

	return (
		<Button
			type="button"
			variant="ghost"
			size="xs"
			role="menuitem"
			aria-haspopup={hasSubMenu ? "menu" : undefined}
			aria-expanded={hasSubMenu ? isActive : undefined}
			disabled={Boolean(option.disabled)}
			title={option.title ?? (typeof option.label === "string" ? option.label : optLabel)}
			onClick={() => onClickOption(option, columnIndex)}
			onMouseEnter={() => onMouseEnterOption(option, columnIndex)}
			className={cn(
				"relative flex h-auto w-full cursor-pointer items-center justify-between gap-1.5 rounded-md px-2.5 py-1.5 text-left text-xs font-normal shadow-none transition-colors outline-hidden select-none",
				"hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
				isActive && "bg-accent/80 text-accent-foreground font-medium",
				option.disabled && "pointer-events-none opacity-50",
			)}
		>
			<span className="flex min-w-0 items-center gap-1.5">
				{option.icon ? <span className="size-3.5 shrink-0">{option.icon}</span> : null}
				<span className="truncate">{optDisplay}</span>
			</span>

			<span className="flex shrink-0 items-center gap-1">
				{isLoading ? (
					<Spinner aria-hidden="true" className="text-muted-foreground size-3.5" />
				) : hasSubMenu ? (
					<ChevronRight aria-hidden="true" className="text-muted-foreground size-3.5 opacity-60" />
				) : isFinalLeaf ? (
					<Check aria-hidden="true" className="text-primary size-3.5" />
				) : null}
			</span>
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
		<div
			role="listbox"
			onKeyDown={(e) => handleListboxKeyDown(e, '[role="option"]')}
			className="no-scrollbar max-h-64 min-w-[280px] overflow-y-auto p-1 text-sm"
		>
			{searchResults.length === 0 ? (
				<div className="text-muted-foreground flex h-24 items-center justify-center text-xs">{emptyText}</div>
			) : (
				searchResults.map((item, idx) => {
					const isSelected =
						item.values.length === currentValue.length &&
						item.values.every((v, i) => String(v) === String(currentValue[i]));

					return (
						<Button
							key={JSON.stringify(item.values) || String(idx)}
							type="button"
							variant="ghost"
							size="xs"
							role="option"
							aria-selected={isSelected}
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
							{isSelected ? <Check aria-hidden="true" className="text-primary size-3.5 shrink-0" /> : null}
						</Button>
					);
				})
			)}
		</div>
	);
}

export function CascaderColumnMenus({
	columns,
	activeValuePath,
	activePath,
	currentValue,
	fieldNames,
	loadingMap,
	emptyText,
	onClickOption,
	onMouseEnterOption,
	onMouseLeaveMenu,
}: {
	columns: CascaderOption[][];
	activeValuePath: (string | number)[];
	activePath: CascaderOption[];
	currentValue: (string | number)[];
	fieldNames: Required<CascaderFieldNames>;
	loadingMap: Record<string, boolean>;
	emptyText: string;
	onClickOption: (option: CascaderOption, columnIndex: number) => void;
	onMouseEnterOption: (option: CascaderOption, columnIndex: number) => void;
	onMouseLeaveMenu: () => void;
}) {
	const handleColumnKeyDown = (e: KeyboardEvent<HTMLDivElement>, colIndex: number) => {
		if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
			handleListboxKeyDown(e, '[role="menuitem"]');
			return;
		}
		if (e.key === "ArrowRight") {
			const nextCol = e.currentTarget.parentElement?.children[colIndex + 1] as HTMLElement | undefined;
			const firstEnabled = nextCol?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])');
			if (firstEnabled) {
				e.preventDefault();
				firstEnabled.focus();
			}
		} else if (e.key === "ArrowLeft" && colIndex > 0) {
			const prevCol = e.currentTarget.parentElement?.children[colIndex - 1] as HTMLElement | undefined;
			const activeInPrev = prevCol?.querySelector<HTMLElement>('[role="menuitem"][aria-expanded="true"]');
			const target = activeInPrev ?? prevCol?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])');
			if (target) {
				e.preventDefault();
				target.focus();
			}
		}
	};

	return (
		<div className="divide-border flex divide-x" onMouseLeave={onMouseLeaveMenu}>
			{columns.map((columnOptions, colIndex) => {
				const activeOptionInCol = activePath[colIndex];
				const prefixPath = activeValuePath.slice(0, colIndex);

				return (
					<div
						key={colIndex}
						role="menu"
						onKeyDown={(e) => handleColumnKeyDown(e, colIndex)}
						className="no-scrollbar h-64 max-w-[200px] min-w-[130px] overflow-y-auto p-1 text-sm"
					>
						{columnOptions.length === 0 ? (
							<div className="text-muted-foreground flex h-full items-center justify-center text-xs">{emptyText}</div>
						) : (
							columnOptions.map((opt) => {
								const optVal = getCascaderOptionValue(opt, fieldNames);
								const optChildren = getCascaderOptionChildren(opt, fieldNames);
								const loadingKey = buildCascaderLoadingKey([...prefixPath, optVal]);

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
										isLoading={Boolean(opt.loading || loadingMap[loadingKey])}
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
