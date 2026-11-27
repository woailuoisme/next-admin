"use client";

import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "cn";

import type { DataTableQuickFilterProps } from "../types";

import { useQuickFilter } from "../hooks/useQuickFilter";

export function DataTableQuickFilter({
	value = "",
	onChange,
	placeholder,
	entity,
	debounceWait = 250,
	className,
}: DataTableQuickFilterProps) {
	const t = useTranslations("table");
	const resolvedPlaceholder =
		placeholder ?? (entity ? t("quick_filter_placeholder_entity", { entity }) : t("quick_filter_placeholder"));

	const { search, handleSearchChange, handleClearSearch } = useQuickFilter({
		value,
		onChange,
		debounceWait,
	});

	return (
		<InputGroup className={cn("w-full sm:w-64", className)}>
			<InputGroupAddon align="inline-start">
				<Search aria-hidden="true" />
			</InputGroupAddon>
			<InputGroupInput
				placeholder={resolvedPlaceholder}
				aria-label={resolvedPlaceholder}
				value={search}
				onChange={(e) => handleSearchChange(e.target.value)}
				className="text-xs"
			/>
			{search ? (
				<InputGroupAddon align="inline-end">
					<InputGroupButton
						type="button"
						variant="ghost"
						size="icon-xs"
						onClick={handleClearSearch}
						className="text-muted-foreground hover:text-foreground cursor-pointer"
						aria-label={t("quick_filter_clear")}
					>
						<X aria-hidden="true" />
					</InputGroupButton>
				</InputGroupAddon>
			) : null}
		</InputGroup>
	);
}
