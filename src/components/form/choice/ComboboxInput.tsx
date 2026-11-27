"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";

import {
	type BaseInputProps,
	connectField,
	FieldClearButton,
	type FormFieldRenderProps,
	type SelectOption,
} from "../core";

const EMPTY_OPTIONS: SelectOption<any>[] = [];

interface ComboboxMenuProps {
	options: SelectOption<any>[];
	value: unknown;
	searchPlaceholder: string;
	emptyText: string;
	onSelectValue: (val: any) => void;
}

const LazyComboboxMenu = dynamic(
	() =>
		import("@/components/ui/command").then((mod) => {
			const { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } = mod;
			return function ComboboxMenu({ options, value, searchPlaceholder, emptyText, onSelectValue }: ComboboxMenuProps) {
				"use no memo";
				return (
					<Command>
						<CommandInput placeholder={searchPlaceholder} />
						<CommandList>
							<CommandEmpty>{emptyText}</CommandEmpty>
							<CommandGroup>
								{options.map((option) => {
									const isSelected =
										value !== undefined && value !== null && value !== "" && String(option.value) === String(value);
									return (
										<CommandItem
											key={String(option.value)}
											value={`${option.label}-${String(option.value)}`}
											keywords={[option.label, String(option.value)]}
											disabled={option.disabled}
											onSelect={() => onSelectValue(option.value)}
											className="cursor-pointer"
										>
											<Check
												aria-hidden="true"
												className={cn("mr-2 size-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")}
											/>
											{option.icon ? <span className="mr-2 shrink-0">{option.icon}</span> : null}
											<div className="flex min-w-0 flex-col">
												<span className="truncate">{option.label}</span>
												{option.description ? (
													<span className="text-muted-foreground truncate text-xs">{option.description}</span>
												) : null}
											</div>
										</CommandItem>
									);
								})}
							</CommandGroup>
						</CommandList>
					</Command>
				);
			};
		}),
	{
		ssr: false,
		loading: () => <Skeleton className="h-32 w-full rounded-lg" />,
	},
);

export interface ComboboxInputProps<TValue extends string | number = string> extends BaseInputProps {
	options: SelectOption<TValue>[];
	value?: TValue;
	defaultValue?: TValue;
	onChange?: (value: TValue) => void;
	onBlur?: () => void;
	searchPlaceholder?: string;
	emptyText?: string;
	clearable?: boolean;
}

type ComboboxExtraProps<TValue extends string | number = string> = Pick<
	ComboboxInputProps<TValue>,
	"options" | "placeholder" | "searchPlaceholder" | "emptyText" | "clearable"
>;

function ComboboxControl<TValue extends string | number = string>({
	id,
	value,
	onChange,
	onBlur,
	disabled,
	readOnly,
	required,
	hasError,
	describedBy,
	clearable = true,
	options = EMPTY_OPTIONS as SelectOption<TValue>[],
	placeholder,
	searchPlaceholder,
	emptyText,
}: FormFieldRenderProps<TValue> & ComboboxExtraProps<TValue>) {
	const t = useTranslations("form");
	const listboxId = useId();
	const triggerRef = useRef<HTMLButtonElement>(null);
	const resolvedPlaceholder = placeholder ?? t("select_placeholder");
	const resolvedSearchPlaceholder = searchPlaceholder ?? t("combobox_search_placeholder");
	const resolvedEmptyText = emptyText ?? t("combobox_empty");
	const clearAriaLabel = t("combobox_clear");
	const [open, setOpen] = useState(false);
	const locked = Boolean(disabled || readOnly);
	const hasValue = value !== undefined && value !== null && value !== "";

	const selectedOption = hasValue ? options.find((opt) => String(opt.value) === String(value)) : undefined;

	const handleOpenChange = (nextOpen: boolean) => {
		if (locked && nextOpen) return;
		setOpen(nextOpen);
		if (!nextOpen) onBlur?.();
	};

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (locked) return;
		onChange(undefined as unknown as TValue);
		triggerRef.current?.focus();
	};

	const handleSelect = (optValue: TValue) => {
		if (locked) return;
		onChange(optValue);
		setOpen(false);
	};

	return (
		<div className="relative flex w-full items-center">
			<Popover open={open} onOpenChange={handleOpenChange}>
				<PopoverTrigger asChild>
					<Button
						ref={triggerRef}
						id={id}
						type="button"
						variant="outline"
						role="combobox"
						aria-expanded={open}
						aria-controls={listboxId}
						aria-readonly={readOnly || undefined}
						aria-invalid={hasError}
						aria-required={required}
						aria-describedby={describedBy}
						disabled={disabled}
						onBlur={() => {
							if (!open) onBlur?.();
						}}
						className={cn(
							"h-9 w-full justify-between px-3 text-left font-normal",
							clearable && hasValue && !locked && "pr-8",
							!selectedOption && "text-muted-foreground",
						)}
					>
						<span className="flex items-center gap-2 truncate">
							{selectedOption?.icon ? <span className="shrink-0">{selectedOption.icon}</span> : null}
							{selectedOption ? selectedOption.label : resolvedPlaceholder}
						</span>
						<ChevronsUpDown aria-hidden="true" className="ml-2 size-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent id={listboxId} className="w-(--radix-popover-trigger-width) p-0" align="start">
					{open ? (
						<LazyComboboxMenu
							options={options}
							value={value}
							searchPlaceholder={resolvedSearchPlaceholder}
							emptyText={resolvedEmptyText}
							onSelectValue={handleSelect}
						/>
					) : null}
				</PopoverContent>
			</Popover>

			{clearable && hasValue && !locked ? (
				<FieldClearButton
					onClick={handleClear}
					ariaLabel={clearAriaLabel}
					className="hover:bg-muted absolute right-7"
				/>
			) : null}
		</div>
	);
}

export const ComboboxInput = connectField<string | number, ComboboxExtraProps<string | number>>(ComboboxControl) as <
	TValue extends string | number = string,
>(
	props: ComboboxInputProps<TValue>,
) => React.ReactElement;
