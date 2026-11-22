"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMemoizedFn } from "ahooks";
import { FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ChangeEvent, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { downloadBlob } from "@/components/data-table/hooks/useDataTableExport";
import { ModalFrame } from "@/components/dialogs/ModalFrame";
import { DIALOG_BODY_CLASS, DIALOG_FOOTER_CLASS } from "@/components/dialogs/sizeClasses";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { invalidateResourceScope } from "@/lib/resource";

import type { ActionRuntimeResourceBridge, ImportActionConfig } from "../types";
import { parseImportFile } from "./fileParsing";
import { guessFieldMapping, ImportPreviewSection, type ValidatedImportRow } from "./ImportPreviewSection";

export interface ImportActionModalProps<TInput extends Record<string, unknown>, TPayload> {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	config: ImportActionConfig<TInput, TPayload>;
	payload: TPayload;
	resourceBridge?: ActionRuntimeResourceBridge | null;
}

function ImportActionModalPanel<TInput extends Record<string, unknown>, TPayload>({
	onOpenChange,
	config,
	payload,
	resourceBridge,
}: Omit<ImportActionModalProps<TInput, TPayload>, "open">) {
	const t = useTranslations("actions");
	const queryClient = useQueryClient();
	const fileInputId = useId();
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const [fileName, setFileName] = useState<string>("");
	const [headers, setHeaders] = useState<string[]>([]);
	const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
	const [fieldToColumn, setFieldToColumn] = useState<Record<string, string>>({});
	const [isImporting, setIsImporting] = useState(false);

	const handleFileSelected = useMemoizedFn(async (file: File) => {
		try {
			const parsed = await parseImportFile(file);
			if (parsed.rows.length === 0) {
				toast.error(t("import_empty_file"));
				return;
			}
			setFileName(file.name);
			setHeaders(parsed.headers);
			setRawRows(parsed.rows);
			setFieldToColumn(guessFieldMapping(parsed.headers, config.fields));
		} catch {
			toast.error(t("import_parse_error"));
		}
	});

	const handleInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) void handleFileSelected(file);
		e.target.value = "";
	});

	const handleDownloadTemplate = useMemoizedFn(() => {
		const colHeaders = config.fields.map((f) => f.key);
		const sampleData = config.sampleRows?.length
			? config.sampleRows
			: [Object.fromEntries(config.fields.map((f) => [f.key, f.label]))];
		const headerLine = colHeaders.map((h) => `"${h}"`).join(",");
		const bodyLines = sampleData.map((row) =>
			colHeaders.map((key) => `"${String(row[key] ?? "").replace(/"/g, '""')}"`).join(","),
		);
		const tplName = config.templateFileName ?? `${resourceBridge?.resource.name ?? "import"}-template.csv`;
		downloadBlob(`\uFEFF${headerLine}\n${bodyLines.join("\n")}`, tplName, "text/csv;charset=utf-8;");
	});

	const validatedRows: ValidatedImportRow<TInput>[] = rawRows.map((raw, index) => {
		const mapped: Record<string, unknown> = {};
		for (const field of config.fields) {
			const sourceCol = fieldToColumn[field.key];
			const val = sourceCol ? raw[sourceCol] : undefined;
			mapped[field.key] = field.transform ? field.transform(val) : val;
		}

		const result = config.rowSchema.safeParse(mapped);
		if (result.success) {
			return { index: index + 1, parsed: result.data, errors: [], raw: mapped };
		}
		const errors = result.error.issues.map((issue) => `${issue.path.join(".") || "row"}: ${issue.message}`);
		return { index: index + 1, errors, raw: mapped };
	});

	const validItems = validatedRows.filter((r): r is ValidatedImportRow<TInput> & { parsed: TInput } =>
		Boolean(r.parsed),
	);

	const handleImportSubmit = useMemoizedFn(async () => {
		if (isImporting || validItems.length === 0) return;
		setIsImporting(true);
		try {
			const validPayloads = validItems.map((item) => item.parsed);
			if (config.onImport) {
				await config.onImport(validPayloads, {
					payload,
					data: {},
					closeModal: () => onOpenChange(false),
					queryClient,
					resourceBridge,
				});
			} else if (resourceBridge?.resource.api.create) {
				const createFn = resourceBridge.resource.api.create;
				const settled = await Promise.allSettled(validPayloads.map((item) => createFn(item)));
				const succeeded = settled.filter((r) => r.status === "fulfilled").length;
				const failed = settled.length - succeeded;
				invalidateResourceScope(queryClient, resourceBridge.resource, config.invalidates);
				if (failed > 0) toast.warning(t("import_partial", { succeeded, failed }));
				else toast.success(t("import_success", { count: succeeded }));
				onOpenChange(false);
				return;
			}

			if (resourceBridge) {
				invalidateResourceScope(queryClient, resourceBridge.resource, config.invalidates);
			} else if (config.invalidates?.length) {
				await Promise.all(config.invalidates.map((key) => queryClient.invalidateQueries({ queryKey: [...key] })));
			}

			toast.success(t("import_success", { count: validPayloads.length }));
			onOpenChange(false);
		} catch {
			toast.error(t("error"));
		} finally {
			setIsImporting(false);
		}
	});

	return (
		<>
			<div className={DIALOG_BODY_CLASS}>
				<div className="space-y-5">
					<div className="border-border/70 bg-muted/20 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-5 text-center">
						<div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
							<FileSpreadsheet className="size-5" aria-hidden="true" />
						</div>
						<div className="space-y-1">
							<p className="text-foreground text-xs font-medium">{fileName || t("import_dropzone")}</p>
							<input
								ref={fileInputRef}
								id={fileInputId}
								type="file"
								accept=".csv,.xlsx,.json"
								onChange={handleInputChange}
								className="sr-only"
							/>
						</div>
						<div className="flex flex-wrap items-center justify-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-8 gap-1.5 text-xs"
								onClick={() => fileInputRef.current?.click()}
								disabled={isImporting}
							>
								<Upload className="size-3.5" aria-hidden="true" />
								<span>{t("import_label")}</span>
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-8 text-xs"
								onClick={handleDownloadTemplate}
								disabled={isImporting}
							>
								{t("import_download_template")}
							</Button>
						</div>
					</div>

					<ImportPreviewSection
						headers={headers}
						fields={config.fields}
						fieldToColumn={fieldToColumn}
						onFieldMappingChange={(fieldKey, col) => setFieldToColumn((prev) => ({ ...prev, [fieldKey]: col }))}
						validatedRows={validatedRows}
						validCount={validItems.length}
					/>
				</div>
			</div>

			<DialogFooter className={DIALOG_FOOTER_CLASS}>
				<Button
					type="button"
					variant="outline"
					onClick={() => onOpenChange(false)}
					disabled={isImporting}
					className="h-8.5 px-4 text-xs"
				>
					{t("cancel")}
				</Button>
				<Button
					type="button"
					onClick={() => void handleImportSubmit()}
					disabled={isImporting || validItems.length === 0}
					className="h-8.5 gap-1.5 px-4 text-xs"
				>
					{isImporting ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
					<span>{t("import_submit", { count: validItems.length })}</span>
				</Button>
			</DialogFooter>
		</>
	);
}

/**
 * 预置导入动作弹窗（支持 CSV/XLSX/JSON 上传解析、列映射、Zod 逐行校验预览与批量写入）
 */
export function ImportActionModal<TInput extends Record<string, unknown>, TPayload>(
	props: ImportActionModalProps<TInput, TPayload>,
) {
	const t = useTranslations("actions");
	const entityName = props.config.entityName ?? props.resourceBridge?.resource.entityName ?? "";
	const title = t("import_title", { entityName: entityName ? ` ${entityName}` : "" }).trim();

	return (
		<ModalFrame
			open={props.open}
			onOpenChange={props.onOpenChange}
			variant="dialog"
			size="lg"
			title={title}
			description={t("import_desc")}
		>
			{props.open ? (
				<ImportActionModalPanel
					onOpenChange={props.onOpenChange}
					config={props.config}
					payload={props.payload}
					resourceBridge={props.resourceBridge}
				/>
			) : null}
		</ModalFrame>
	);
}
