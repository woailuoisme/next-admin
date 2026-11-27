"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, type ReactNode, useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import { createContainerBlurHandler, FieldClearButton } from "../core";
import { CascaderColumnMenus, CascaderSearchResults } from "./CascaderMenus";
import {
	getCascaderOptionChildren,
	getCascaderOptionDisplayNode,
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
	options?: CascaderOption[];
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
	const triggerRef = useRef<HTMLButtonElement>(null);
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
		separator,
		disabled,
		readOnly,
		onBlur,
	});

	const hasSelected = state.selectedOptions.length > 0;
	let displayNode: ReactNode = null;
	if (hasSelected) {
		if (displayRender) {
			const labels = state.selectedOptions.map((o) => getCascaderOptionLabel(o, state.fieldNames));
			displayNode = displayRender(labels, state.selectedOptions);
		} else {
			displayNode = state.selectedOptions.map((o, idx) => (
				<Fragment key={String(getCascaderOptionValue(o, state.fieldNames))}>
					{idx > 0 ? separator : null}
					{getCascaderOptionDisplayNode(o, state.fieldNames)}
				</Fragment>
			));
		}
	}

	const handleContainerBlur = createContainerBlurHandler<HTMLDivElement>(() => {
		if (!state.open) onBlur?.();
	});

	return (
		<Popover open={state.open} onOpenChange={state.handleOpenChange}>
			<div className="relative flex w-full items-center" onBlur={handleContainerBlur}>
				<PopoverTrigger asChild>
					<Button
						ref={triggerRef}
						id={triggerId}
						type="button"
						variant="outline"
						role="combobox"
						aria-expanded={state.open}
						aria-controls={contentId}
						aria-readonly={readOnly || undefined}
						aria-label={ariaLabel}
						aria-invalid={ariaInvalid}
						aria-describedby={ariaDescribedBy}
						disabled={disabled}
						onKeyDown={state.handleTriggerKeyDown}
						className={cn(
							"w-full justify-between text-left font-normal transition-colors select-none",
							SIZE_CLASSES[size],
							state.canClear && "pr-8",
							!hasSelected && "text-muted-foreground",
							className,
						)}
					>
						<span className="flex min-w-0 flex-1 items-center gap-2">
							{state.selectedOptions[0]?.icon ? (
								<span className="shrink-0">{state.selectedOptions[0].icon}</span>
							) : null}
							<span className="truncate">{displayNode ?? placeholder}</span>
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

				{state.canClear ? (
					<FieldClearButton
						onClick={(e) => {
							state.handleClear(e);
							triggerRef.current?.focus();
						}}
						ariaLabel={t("cascader_clear")}
						className="hover:bg-muted absolute right-7"
					/>
				) : null}
			</div>

			<PopoverContent
				id={contentId}
				align="start"
				sideOffset={4}
				className={cn("ring-border/50 w-auto min-w-[200px] p-0 shadow-lg ring-1", popupClassName)}
			>
				{showSearch ? (
					<div className="border-border border-b p-2">
						<InputGroup>
							<InputGroupAddon align="inline-start">
								<Search aria-hidden="true" className="size-3.5" />
							</InputGroupAddon>
							<InputGroupInput
								type="text"
								value={state.searchQuery}
								onChange={(e) => state.setSearchQuery(e.target.value)}
								aria-label={searchPlaceholder}
								placeholder={searchPlaceholder}
								className="text-xs"
							/>
							{state.searchQuery ? (
								<InputGroupAddon align="inline-end">
									<InputGroupButton
										type="button"
										size="icon-xs"
										variant="ghost"
										onClick={() => state.setSearchQuery("")}
										aria-label={t("cascader_clear_search")}
									>
										<X className="size-3" aria-hidden="true" />
									</InputGroupButton>
								</InputGroupAddon>
							) : null}
						</InputGroup>
					</div>
				) : null}

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
						activeValuePath={state.activeValuePath}
						activePath={state.activePath}
						currentValue={state.currentValue}
						fieldNames={state.fieldNames}
						loadingMap={state.loadingMap}
						emptyText={emptyText}
						onClickOption={state.handleItemClick}
						onMouseEnterOption={state.handleItemMouseEnter}
						onMouseLeaveMenu={state.handleMenuMouseLeave}
					/>
				)}
			</PopoverContent>
		</Popover>
	);
}
