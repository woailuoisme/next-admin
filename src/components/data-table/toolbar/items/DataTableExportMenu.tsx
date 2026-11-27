"use client";

import { useTranslations } from "next-intl";
import { ArrowDownToLine, FileSpreadsheet, FileText, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { NOOP } from "../../core/constants";
import type { DataTableExportMenuProps } from "../types";

export function DataTableExportMenu({
	onExportExcel = NOOP,
	onExportCsv = NOOP,
	onExportJson = NOOP,
	onPrint = NOOP,
}: DataTableExportMenuProps) {
	const t = useTranslations("table");

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground h-8 text-xs">
					<ArrowDownToLine aria-hidden="true" data-icon="inline-start" />
					<span>{t("export_button")}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-44">
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={onExportExcel} className="gap-2 text-xs">
						<FileSpreadsheet aria-hidden="true" className="text-muted-foreground" />
						<span>{t("export_excel")}</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onExportCsv} className="gap-2 text-xs">
						<FileText aria-hidden="true" className="text-muted-foreground" />
						<span>{t("export_csv")}</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onExportJson} className="gap-2 text-xs">
						<FileText aria-hidden="true" className="text-muted-foreground" />
						<span>{t("export_json")}</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={onPrint} className="gap-2 text-xs">
						<Printer aria-hidden="true" className="text-muted-foreground" />
						<span>{t("export_print")}</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
