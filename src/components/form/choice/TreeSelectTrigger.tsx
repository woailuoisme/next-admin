"use client";

import { ChevronDown, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import { FieldClearButton } from "../core";
import type { InternalTreeNode, TreeSelectValue } from "./treeEngine";

const SIZE_CLASSES = {
	sm: "min-h-8 px-2.5 py-1 text-xs",
	default: "min-h-9 px-3 py-1.5 text-sm",
	lg: "min-h-10 px-3.5 py-2 text-base",
} as const;

export interface TreeSelectTriggerProps {
	triggerId: string;
	listboxId: string;
	open: boolean;
	isMultiple: boolean;
	hasSelection: boolean;
	canClear: boolean;
	disabled: boolean;
	readOnly: boolean;
	size: "sm" | "default" | "lg";
	placeholder: string;
	activeValue: TreeSelectValue | TreeSelectValue[] | undefined;
	rawValues: TreeSelectValue[];
	maxTagCount: number;
	maxTagPlaceholder?: (omittedValues: TreeSelectValue[]) => ReactNode;
	nodeMap: Map<TreeSelectValue, InternalTreeNode>;
	className?: string;
	ariaLabel?: string;
	ariaInvalid?: boolean;
	ariaDescribedBy?: string;
	onBlur?: () => void;
	onClear: (e?: MouseEvent<HTMLButtonElement>) => void;
	onRemoveTag: (key: TreeSelectValue, e: MouseEvent<HTMLButtonElement>) => void;
	onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
}

export function TreeSelectTrigger({
	triggerId,
	listboxId,
	open,
	isMultiple,
	hasSelection,
	canClear,
	disabled,
	readOnly,
	size,
	placeholder,
	activeValue,
	rawValues,
	maxTagCount,
	maxTagPlaceholder,
	nodeMap,
	className,
	ariaLabel,
	ariaInvalid,
	ariaDescribedBy,
	onBlur,
	onClear,
	onRemoveTag,
	onKeyDown,
}: TreeSelectTriggerProps) {
	const t = useTranslations("form");
	const visibleTags = typeof maxTagCount === "number" ? rawValues.slice(0, maxTagCount) : rawValues;
	const omittedCount = rawValues.length - visibleTags.length;

	return (
		<div className="relative flex w-full items-center">
			{isMultiple ? (
				<div
					className={cn(
						"border-input bg-background flex w-full flex-wrap items-center gap-1 rounded-md border shadow-xs transition-colors",
						canClear && "pr-8",
						disabled && "pointer-events-none cursor-not-allowed opacity-50",
						ariaInvalid && "border-destructive",
						SIZE_CLASSES[size],
						className,
					)}
				>
					{visibleTags.map((key) => {
						const item = nodeMap.get(key);
						const tagLabel = item?.label ?? String(key);
						return (
							<Badge
								key={String(key)}
								variant="secondary"
								className="bg-muted text-foreground hover:bg-muted/80 inline-flex max-w-[160px] items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-normal"
							>
								<span className="truncate">{tagLabel}</span>
								{!disabled && !readOnly && (
									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										onClick={(e) => onRemoveTag(key, e)}
										aria-label={t("treeselect_remove_tag", { label: tagLabel })}
										className="text-muted-foreground hover:text-foreground relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 after:absolute after:-inset-1.5 hover:bg-transparent"
									>
										<X aria-hidden="true" className="size-2.5" />
									</Button>
								)}
							</Badge>
						);
					})}

					{omittedCount > 0 && (
						<Tooltip>
							<TooltipTrigger asChild>
								<span>
									<Badge
										variant="outline"
										className="border-border bg-background text-muted-foreground hover:bg-accent inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-normal"
									>
										+{omittedCount}...
									</Badge>
								</span>
							</TooltipTrigger>
							<TooltipContent className="max-w-xs text-xs">
								{maxTagPlaceholder ? (
									maxTagPlaceholder(rawValues.slice(maxTagCount))
								) : (
									<div className="flex flex-wrap gap-1">
										{rawValues.slice(maxTagCount).map((k) => (
											<span key={String(k)} className="bg-muted/60 rounded-xs px-1 py-0.5">
												{nodeMap.get(k)?.label ?? String(k)}
											</span>
										))}
									</div>
								)}
							</TooltipContent>
						</Tooltip>
					)}

					<PopoverTrigger asChild>
						<Button
							id={triggerId}
							type="button"
							variant="ghost"
							role="combobox"
							aria-expanded={open}
							aria-controls={listboxId}
							aria-haspopup="tree"
							aria-readonly={readOnly || undefined}
							aria-label={ariaLabel || placeholder}
							aria-invalid={ariaInvalid}
							aria-describedby={ariaDescribedBy}
							disabled={disabled}
							onKeyDown={onKeyDown}
							onBlur={() => !open && onBlur?.()}
							className={cn(
								"h-auto min-w-0 flex-1 justify-between gap-2 px-1 py-0.5 text-left font-normal shadow-none hover:bg-transparent",
								!hasSelection ? "text-muted-foreground" : "justify-end",
							)}
						>
							{!hasSelection ? (
								<span className="truncate">{placeholder}</span>
							) : (
								<span className="sr-only">{placeholder}</span>
							)}
							<ChevronDown
								aria-hidden="true"
								className={cn(
									"text-muted-foreground size-4 shrink-0 transition-transform duration-200",
									open && "rotate-180",
								)}
							/>
						</Button>
					</PopoverTrigger>
				</div>
			) : (
				<PopoverTrigger asChild>
					<Button
						id={triggerId}
						type="button"
						variant="outline"
						role="combobox"
						aria-expanded={open}
						aria-controls={listboxId}
						aria-haspopup="tree"
						aria-readonly={readOnly || undefined}
						aria-label={ariaLabel || placeholder}
						aria-invalid={ariaInvalid}
						aria-describedby={ariaDescribedBy}
						disabled={disabled}
						onKeyDown={onKeyDown}
						onBlur={() => !open && onBlur?.()}
						className={cn(
							"w-full justify-between gap-2 text-left font-normal shadow-xs",
							canClear && "pr-8",
							ariaInvalid && "border-destructive focus-visible:ring-destructive",
							SIZE_CLASSES[size],
							className,
						)}
					>
						{hasSelection ? (
							<span className="text-foreground flex-1 truncate font-normal">
								{nodeMap.get(activeValue as TreeSelectValue)?.label ?? String(activeValue)}
							</span>
						) : (
							<span className="text-muted-foreground truncate">{placeholder}</span>
						)}
						<ChevronDown
							aria-hidden="true"
							className={cn(
								"text-muted-foreground size-4 shrink-0 transition-transform duration-200",
								open && "rotate-180",
							)}
						/>
					</Button>
				</PopoverTrigger>
			)}

			{canClear && (
				<FieldClearButton
					onClick={onClear}
					ariaLabel={t("treeselect_clear")}
					className="hover:bg-muted absolute right-7 z-10"
				/>
			)}
		</div>
	);
}
