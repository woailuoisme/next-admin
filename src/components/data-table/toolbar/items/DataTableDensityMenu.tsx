"use client";

import { useTranslations } from "next-intl";
import { Check, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { NOOP } from "../../core/constants";
import type { DataTableDensity } from "../../core/types";
import type { DataTableDensityMenuProps } from "../types";

export function DataTableDensityMenu({ density = "standard", onDensityChange = NOOP }: DataTableDensityMenuProps) {
	const t = useTranslations("table");

	const densityOptions: Array<{ value: DataTableDensity; label: string }> = [
		{ value: "compact", label: t("density_compact") },
		{ value: "standard", label: t("density_standard") },
		{ value: "comfortable", label: t("density_comfortable") },
	];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground h-8 text-xs">
					<SlidersHorizontal aria-hidden="true" data-icon="inline-start" />
					<span>{t("density_button")}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-36">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="text-xs">{t("density_title")}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{densityOptions.map((opt) => (
						<DropdownMenuItem
							key={opt.value}
							onClick={() => onDensityChange(opt.value)}
							className="flex items-center justify-between text-xs"
						>
							<span>{opt.label}</span>
							{density === opt.value ? <Check aria-hidden="true" className="text-primary" /> : null}
						</DropdownMenuItem>
					))}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
