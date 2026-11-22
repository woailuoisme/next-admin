"use client";

import { ChevronDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useId } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import { FieldClearButton } from "../core";
import { CascaderColumnMenus, CascaderSearchResults } from "./CascaderMenus";
import {
	getCascaderOptionChildren,
	getCascaderOptionLabel,
	getCascaderOptionValue,
	resolveCascaderOptionsByValue,
	type CascaderFieldNames,
	type CascaderOption,
} from "./treeEngine";
import { useCascaderState } from "./useCascaderState";

export type { CascaderFieldNames, CascaderOption };

export {
	getCascaderOptionChildren as getOptionChildren,
	getCascaderOptionLabel as getOptionLabel,
	getCascaderOptionValue as getOptionValue,
	resolveCascaderOptionsByValue as resolveOptionsByValue,
};

export interface CascaderProps {
	options: CascaderOption[];
	value?: (string | number)[];
	defaultValue?: (string | number)[];
	onChange?: (value: (string | number)[], selectedOptions: CascaderOption[]) => void;
	expandTrigger?: "click" | "hover";
	changeOnSelect?: boolean;
	loadData?: (selectedOptions: CascaderOption[]) => Promise<void> | void;
	showSearch?: boolean;
	fieldNames?: CascaderFieldNames;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	allowClear?: boolean;
	clearable?: boolean;
	separator?: string;
	displayRender?: (labels: string[], selectedOptions: CascaderOption[]) => ReactNode;
	disabled?: boolean;
	readOnly?: boolean;
	onBlur?: () => void;
	className?: string;
	popupClassName?: string;
	id?: string;
	size?: "sm" | "default" | "lg";
	"aria-label"?: string;
	"aria-invalid"?: boolean;
	"aria-describedby"?: string;
}

const EMPTY_OPTIONS: CascaderOption[] = [];

const SIZE_CLASSES = {
	sm: "h-8 px-2 text-xs",
	default: "h-9 px-3 text-sm",
	lg: "h-10 px-3.5 text-base",
} as const;

export function Cascader({
	options = EMPTY_OPTIONS,
	value,
	defaultValue,
	onChange,
	expandTrigger = "click",
	changeOnSelect = false,
	loadData,
	showSearch = false,
	fieldNames: customFieldNames,
	placeholder: propPlaceholder,
	searchPlaceholder: propSearchPlaceholder,
	emptyText: propEmptyText,
	allowClear = true,
	clearable = true,
	separator = " / ",
	displayRender,
	disabled = false,
	readOnly = false,
	onBlur,
	className,
	popupClassName,
	id,
	size = "default",
	"aria-label": ariaLabel,
	"aria-invalid": ariaInvalid,
	"aria-describedby": ariaDescribedBy,
}: CascaderProps) {
	const t = useTranslations("form");
	const placeholder = propPlaceholder ?? t("cascader_placeholder");
	const searchPlaceholder = propSearchPlaceholder ?? t("cascader_search_placeholder");
	const emptyText = propEmptyText ?? t("cascader_empty");

	const autoId = useId();
	const triggerId = id || `cascader-${autoId}`;
	const contentId = `cascader-content-${autoId}`;

	const state = useCascaderState({
		options,
		value,
		defaultValue,
		onChange,
		expandTrigger,
		changeOnSelect,
		loadData,
		customFieldNames,
		allowClear,
		clearable,
		disabled,
		readOnly,
		onBlur,
	});

	const displayText =
		state.selectedOptions.length === 0
			? null
			: (() => {
					const labels = state.selectedOptions.map((o) => getCascaderOptionLabel(o, state.fieldNames));
					return displayRender ? displayRender(labels, state.selectedOptions) : labels.join(separator);
				})();

	return (
		<Popover open={state.open} onOpenChange={state.handleOpenChange}>
			<div className="relative flex w-full items-center">
				<PopoverTrigger asChild>
					<Button
						id={triggerId}
						type="button"
						variant="outline"
						role="combobox"
						aria-expanded={state.open}
						aria-controls={contentId}
						aria-readonly={readOnly || undefined}
						aria-label={ariaLabel || placeholder}
						aria-invalid={ariaInvalid}
						aria-describedby={ariaDescribedBy}
						disabled={disabled}
						onKeyDown={state.handleTriggerKeyDown}
						onBlur={() => !state.open && onBlur?.()}
						className={cn(
							"w-full justify-between text-left font-normal select-none transition-colors",
							SIZE_CLASSES[size],
							state.canClear && "pr-8",
							state.currentValue.length === 0 && "text-muted-foreground",
							ariaInvalid && "border-destructive focus-visible:ring-destructive",
							className,
						)}
					>
						<span className="flex items-center gap-2 truncate">
							{state.selectedOptions[0]?.icon && <span className="shrink-0">{state.selectedOptions[0].icon}</span>}
							<span className="truncate">{displayText || placeholder}</span>
						</span>

						<ChevronDown
							aria-hidden="true"
							className={cn(
								"ml-2 size-4 shrink-0 opacity-50 transition-transform duration-200",
								state.open && "rotate-180",
							)}
						/>
					</Button>
				</PopoverTrigger>

				{state.canClear && (
					<FieldClearButton
						onClick={state.handleClear}
						ariaLabel={t("cascader_clear")}
						className="hover:bg-muted absolute right-7 z-10"
					/>
				)}
			</div>

			<PopoverContent
				id={contentId}
				align="start"
				sideOffset={4}
				className={cn("ring-border/50 z-50 w-auto min-w-[200px] p-0 shadow-lg ring-1", popupClassName)}
			>
				{showSearch && (
					<div className="border-border border-b p-2">
						<div className="relative flex items-center">
							<Search
								aria-hidden="true"
								className="text-muted-foreground pointer-events-none absolute left-2.5 size-3.5"
							/>
							<Input
								type="text"
								value={state.searchQuery}
								onChange={(e) => state.setSearchQuery(e.target.value)}
								aria-label={searchPlaceholder}
								placeholder={searchPlaceholder}
								className="bg-muted/50 h-8 w-full pr-7 pl-8 text-xs shadow-none"
							/>
							{state.searchQuery && (
								<FieldClearButton
									onClick={() => state.setSearchQuery("")}
									ariaLabel={t("cascader_clear_search")}
									className="absolute right-1.5"
								/>
							)}
						</div>
					</div>
				)}

				{state.searchQuery.trim() ? (
					<CascaderSearchResults
						searchResults={state.searchResults}
						searchQuery={state.searchQuery}
						currentValue={state.currentValue}
						separator={separator}
						emptyText={emptyText}
						onSelectPath={state.handleSelectPath}
					/>
				) : (
					<CascaderColumnMenus
						columns={state.columns}
						activePath={state.activePath}
						currentValue={state.currentValue}
						fieldNames={state.fieldNames}
						loadingMap={state.loadingMap}
						emptyText={emptyText}
						onClickOption={state.handleItemClick}
						onMouseEnterOption={state.handleItemMouseEnter}
					/>
				)}
			</PopoverContent>
		</Popover>
	);
}
