"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { ImportFieldDef } from "../types";

export const UNMAPPED_VALUE = "__unmapped__";

export interface ValidatedImportRow<TInput> {
	index: number;
	parsed?: TInput;
	errors: string[];
	raw: Record<string, unknown>;
}

export function guessFieldMapping(headers: string[], fields: readonly ImportFieldDef[]): Record<string, string> {
	const mapping: Record<string, string> = {};
	for (const field of fields) {
		const candidates = [field.key, field.label, ...(field.aliases ?? [])].map((c) => c.trim().toLowerCase());
		const matched = headers.find((header) => candidates.includes(header.trim().toLowerCase()));
		if (matched) mapping[field.key] = matched;
	}
	return mapping;
}

interface ImportPreviewSectionProps<TInput> {
	headers: string[];
	fields: readonly ImportFieldDef[];
	fieldToColumn: Record<string, string>;
	onFieldMappingChange: (fieldKey: string, column: string) => void;
	validatedRows: ValidatedImportRow<TInput>[];
	validCount: number;
}

export function ImportPreviewSection<TInput>({
	headers,
	fields,
	fieldToColumn,
	onFieldMappingChange,
	validatedRows,
	validCount,
}: ImportPreviewSectionProps<TInput>) {
	const t = useTranslations("actions");
	const invalidCount = validatedRows.length - validCount;

	return (
		<>
			{headers.length > 0 ? (
				<div className="flex flex-col gap-2.5">
					<h4 className="text-foreground text-xs font-semibold">{t("import_mapping_title")}</h4>
					<div className="border-border/70 divide-border/60 divide-y rounded-lg border">
						{fields.map((field) => (
							<div key={field.key} className="grid grid-cols-12 items-center gap-3 px-3 py-2 text-xs">
								<div className="col-span-5 flex items-center gap-1.5 font-medium">
									<span>{field.label}</span>
									{field.required ? <span className="text-destructive">*</span> : null}
								</div>
								<div className="col-span-7">
									<Select
										value={fieldToColumn[field.key] ?? UNMAPPED_VALUE}
										onValueChange={(val) => onFieldMappingChange(field.key, val === UNMAPPED_VALUE ? "" : val)}
									>
										<SelectTrigger className="h-8 text-xs">
											<SelectValue placeholder={t("import_unmapped")} />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value={UNMAPPED_VALUE} className="text-muted-foreground text-xs">
													{t("import_unmapped")}
												</SelectItem>
												{headers.map((h) => (
													<SelectItem key={h} value={h} className="text-xs">
														{h}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>
							</div>
						))}
					</div>
				</div>
			) : null}

			{validatedRows.length > 0 ? (
				<div className="flex flex-col gap-2.5">
					<div className="flex items-center justify-between">
						<h4 className="text-foreground text-xs font-semibold">{t("import_preview_title")}</h4>
						<div className="flex items-center gap-2">
							<Badge variant="outline" className="border-chart-2/40 text-chart-2 gap-1 text-[11px]">
								<CheckCircle2 className="size-3" />
								{t("import_valid_count", { count: validCount })}
							</Badge>
							{invalidCount > 0 ? (
								<Badge variant="outline" className="border-destructive/40 text-destructive gap-1 text-[11px]">
									<AlertCircle className="size-3" />
									{t("import_error_count", { count: invalidCount })}
								</Badge>
							) : null}
						</div>
					</div>

					<div className="border-border/70 max-h-48 overflow-auto rounded-lg border">
						<table className="w-full text-left text-xs">
							<thead className="bg-muted/40 border-border/60 border-b">
								<tr>
									<th className="px-2.5 py-1.5 font-medium">#</th>
									{fields.slice(0, 3).map((f) => (
										<th key={f.key} className="px-2.5 py-1.5 font-medium">
											{f.label}
										</th>
									))}
									<th className="px-2.5 py-1.5 font-medium">{t("import_row_status")}</th>
								</tr>
							</thead>
							<tbody className="divide-border/50 divide-y">
								{validatedRows.slice(0, 8).map((item) => (
									<tr key={item.index}>
										<td className="text-muted-foreground px-2.5 py-1.5 font-mono">{item.index}</td>
										{fields.slice(0, 3).map((f) => (
											<td key={f.key} className="max-w-32 truncate px-2.5 py-1.5">
												{String(item.raw[f.key] ?? "")}
											</td>
										))}
										<td className="px-2.5 py-1.5">
											{item.errors.length === 0 ? (
												<Badge variant="secondary" className="text-chart-2 text-[10px]">
													{t("import_row_valid")}
												</Badge>
											) : (
												<span className="text-destructive text-[11px]" title={item.errors.join("; ")}>
													{item.errors[0]}
												</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			) : null}
		</>
	);
}
