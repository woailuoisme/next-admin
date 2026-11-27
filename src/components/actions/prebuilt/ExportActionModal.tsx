"use client";

import { useMemoizedFn } from "ahooks";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { toast } from "sonner";

import { ModalFrame } from "@/components/dialogs/ModalFrame";
import { DIALOG_BODY_CLASS, DIALOG_FOOTER_CLASS } from "@/components/dialogs/sizeClasses";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

import type { ActionRuntimeResourceBridge, ExportActionConfig, ExportColumnOption, ExportFormat } from "../types";
import { resolveActionValue } from "../utils";
import { ExportColumnsPicker, inferExportColumnsFromRows } from "./ExportColumnsPicker";
import { executeExportRows } from "./fileParsing";

export interface ExportActionModalProps<TPayload, TItem> {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	config: ExportActionConfig<TPayload, TItem>;
	payload: TPayload;
	resourceBridge?: ActionRuntimeResourceBridge | null;
	onExported?: () => void;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
	xlsx: "Excel (.xlsx)",
	csv: "CSV (.csv)",
	json: "JSON (.json)",
};

function ExportActionModalPanel<TPayload, TItem>({
	onOpenChange,
	config,
	payload,
	resourceBridge,
	onExported,
}: Omit<ExportActionModalProps<TPayload, TItem>, "open">) {
	const t = useTranslations("actions");
	const fileNameId = useId();
	const formatId = useId();

	const formats = config.formats?.length ? config.formats : (["xlsx", "csv", "json"] as const);
	const [format, setFormat] = useState<ExportFormat>(config.defaultFormat ?? formats[0]);
	const [isExporting, setIsExporting] = useState(false);

	const initialRows = Array.isArray(payload) ? (payload as unknown as TItem[]) : (resourceBridge?.rows ?? []);
	const submitLabel =
		config.resolveRows && initialRows.length === 0
			? t("export_submit_async")
			: t("export_submit", { count: initialRows.length });
	const availableColumns: ExportColumnOption<TItem>[] = config.columns?.length
		? config.columns
		: inferExportColumnsFromRows(initialRows);

	const [selectedFields, setSelectedFields] = useState<string[]>(() =>
		availableColumns.filter((c) => c.defaultSelected !== false).map((c) => c.field),
	);

	const defaultFileName =
		resolveActionValue(config.fileName, payload) ?? `${resourceBridge?.resource.name ?? "records"}-export`;
	const [fileName, setFileName] = useState(defaultFileName);

	const toggleField = (field: string, checked: boolean) => {
		setSelectedFields((prev) => (checked ? [...prev, field] : prev.filter((f) => f !== field)));
	};

	const handleSubmit = useMemoizedFn(async () => {
		if (isExporting) return;
		if (selectedFields.length === 0 && availableColumns.length > 0) {
			toast.error(t("export_no_columns"));
			return;
		}

		setIsExporting(true);
		try {
			const resolvedRows = config.resolveRows
				? await config.resolveRows(payload, resourceBridge)
				: Array.isArray(payload)
					? (payload as unknown as TItem[])
					: ((resourceBridge?.rows ?? []) as TItem[]);

			if (!resolvedRows.length) {
				toast.error(t("export_empty"));
				return;
			}

			const activeColumns =
				availableColumns.length > 0
					? availableColumns.filter((col) => selectedFields.includes(col.field))
					: inferExportColumnsFromRows(resolvedRows);

			await executeExportRows({ rows: resolvedRows, columns: activeColumns, format, fileName });
			await config.after?.({ format, count: resolvedRows.length, payload });
			toast.success(t("export_success", { count: resolvedRows.length }));
			onExported?.();
			onOpenChange(false);
		} catch {
			toast.error(t("error"));
		} finally {
			setIsExporting(false);
		}
	});

	return (
		<>
			<div className={DIALOG_BODY_CLASS}>
				<div className="flex flex-col gap-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor={formatId} className="text-xs font-medium">
								{t("export_format")}
							</Label>
							<Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
								<SelectTrigger id={formatId} className="h-9 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{formats.map((item) => (
											<SelectItem key={item} value={item} className="text-xs">
												{FORMAT_LABELS[item]}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor={fileNameId} className="text-xs font-medium">
								{t("export_filename")}
							</Label>
							<Input
								id={fileNameId}
								value={fileName}
								onChange={(e) => setFileName(e.target.value)}
								className="h-9 text-xs"
								disabled={isExporting}
							/>
						</div>
					</div>

					{availableColumns.length > 0 ? (
						<ExportColumnsPicker
							columns={availableColumns}
							selectedFields={selectedFields}
							isExporting={isExporting}
							onSelectAll={() => setSelectedFields(availableColumns.map((c) => c.field))}
							onDeselectAll={() => setSelectedFields([])}
							onToggleField={toggleField}
						/>
					) : null}
				</div>
			</div>

			<DialogFooter className={DIALOG_FOOTER_CLASS}>
				<Button
					type="button"
					variant="outline"
					onClick={() => onOpenChange(false)}
					disabled={isExporting}
					className="h-8.5 px-4 text-xs"
				>
					{t("cancel")}
				</Button>
				<Button type="button" onClick={() => void handleSubmit()} disabled={isExporting} className="h-8.5 px-4 text-xs">
					{isExporting ? (
						<Spinner data-icon="inline-start" role={undefined} aria-hidden="true" />
					) : (
						<Download data-icon="inline-start" aria-hidden="true" />
					)}
					{submitLabel}
				</Button>
			</DialogFooter>
		</>
	);
}

/**
 * 预置导出动作弹窗（支持格式切换、文件名编辑、动态选列与 XLSX/CSV/JSON 导出）
 */
export function ExportActionModal<TPayload, TItem>(props: ExportActionModalProps<TPayload, TItem>) {
	const t = useTranslations("actions");
	const entityName = props.resourceBridge?.resource.entityName ?? "";
	const title = t("export_title", { entityName: entityName ? ` ${entityName}` : "" }).trim();

	return (
		<ModalFrame
			open={props.open}
			onOpenChange={props.onOpenChange}
			variant="dialog"
			size="md"
			title={title}
			description={t("export_desc")}
		>
			{props.open ? (
				<ExportActionModalPanel
					onOpenChange={props.onOpenChange}
					config={props.config}
					payload={props.payload}
					resourceBridge={props.resourceBridge}
					onExported={props.onExported}
				/>
			) : null}
		</ModalFrame>
	);
}
