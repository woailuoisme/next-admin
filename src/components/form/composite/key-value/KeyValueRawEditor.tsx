"use client";

import { AlertCircle, Check, Code2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { convertRawFormat, formatJsonText, rawToRows, type RawParseErrorDescriptor, rowsToRaw } from "./parsers";
import type { KeyValueRawFormat, KeyValueRowItem } from "./types";

interface KeyValueRawEditorProps {
	rows: KeyValueRowItem[];
	defaultFormat?: KeyValueRawFormat;
	disabled?: boolean;
	readOnly?: boolean;
	allowDuplicateKeys?: boolean;
	onChange: (rows: KeyValueRowItem[]) => void;
	onClose: () => void;
}

export function KeyValueRawEditor({
	rows,
	defaultFormat = "json",
	disabled,
	readOnly,
	allowDuplicateKeys = false,
	onChange,
	onClose,
}: KeyValueRawEditorProps) {
	const t = useTranslations("form");
	const alertId = useId();
	const [format, setFormat] = useState<KeyValueRawFormat>(defaultFormat);
	const [text, setText] = useState<string>(() => rowsToRaw(rows, defaultFormat));
	const [error, setError] = useState<string | null>(null);
	const [syncMarker, setSyncMarker] = useState<{ prevRows: KeyValueRowItem[]; isInternal: boolean }>({
		prevRows: rows,
		isInternal: false,
	});

	if (syncMarker.prevRows !== rows) {
		if (syncMarker.isInternal) {
			setSyncMarker({ prevRows: rows, isInternal: false });
		} else {
			setSyncMarker({ prevRows: rows, isInternal: false });
			setText(rowsToRaw(rows, format));
		}
	}

	const isLocked = Boolean(disabled || readOnly);

	const translateDescriptor = (desc?: RawParseErrorDescriptor, fallback?: string): string => {
		if (desc) {
			return t(desc.key, desc.params);
		}
		return fallback || t("keyvalue_raw_syntax_error", { format: format.toUpperCase() });
	};

	const handleFormatChange = (nextFormat: KeyValueRawFormat) => {
		if (isLocked || nextFormat === format) return;
		const { text: nextText, error: convertErr } = convertRawFormat(text, format, nextFormat, allowDuplicateKeys);
		if (convertErr || nextText === undefined) {
			setError(t("keyvalue_raw_fix_syntax", { format: format.toUpperCase() }));
			return;
		}
		setFormat(nextFormat);
		setText(nextText);
		setError(null);
	};

	const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (isLocked) return;
		const val = e.target.value;
		setText(val);

		const { rows: parsedRows, error: parseErr, errorDescriptor } = rawToRows(val, format, allowDuplicateKeys);
		if (parseErr) {
			setError(translateDescriptor(errorDescriptor, parseErr));
		} else {
			setError(null);
			setSyncMarker((prev) => ({ ...prev, isInternal: true }));
			onChange(parsedRows);
		}
	};

	const handleFormatJson = () => {
		if (isLocked || format !== "json") return;
		const { formatted, error: fmtErr, errorDescriptor } = formatJsonText(text);
		if (fmtErr || formatted === undefined) {
			setError(translateDescriptor(errorDescriptor, fmtErr));
			return;
		}
		setText(formatted);
		setError(null);
	};

	const handleApplyAndClose = () => {
		if (disabled) return;
		const { rows: parsedRows, error: parseErr, errorDescriptor } = rawToRows(text, format, allowDuplicateKeys);
		if (parseErr) {
			setError(translateDescriptor(errorDescriptor, parseErr));
			return;
		}
		setSyncMarker((prev) => ({ ...prev, isInternal: true }));
		onChange(parsedRows);
		onClose();
	};

	return (
		<div className="border-border/80 bg-card/60 flex flex-col gap-2 rounded-lg border p-3 shadow-2xs">
			<div className="border-border/40 flex items-center justify-between gap-2 border-b pb-2">
				<div className="flex items-center gap-1.5">
					<Code2 className="text-primary size-3.5" aria-hidden="true" />
					<span className="text-foreground text-xs font-semibold">{t("keyvalue_raw_title")}</span>
					<div className="ml-2 flex items-center gap-1">
						<Button
							type="button"
							variant={format === "json" ? "secondary" : "ghost"}
							size="xs"
							disabled={isLocked}
							onClick={() => handleFormatChange("json")}
							className="h-6 px-2 text-xs"
						>
							JSON
						</Button>
						<Button
							type="button"
							variant={format === "env" ? "secondary" : "ghost"}
							size="xs"
							disabled={isLocked}
							onClick={() => handleFormatChange("env")}
							className="h-6 px-2 text-xs"
						>
							{t("keyvalue_raw_env_tab")}
						</Button>
					</div>
				</div>

				<div className="flex items-center gap-1">
					{format === "json" ? (
						<Button
							type="button"
							variant="ghost"
							size="xs"
							disabled={isLocked}
							onClick={handleFormatJson}
							className="text-muted-foreground hover:text-foreground h-6 gap-1 text-xs"
							title={t("keyvalue_raw_format_json")}
						>
							<Sparkles className="size-3" aria-hidden="true" />
							<span>{t("keyvalue_raw_format_action")}</span>
						</Button>
					) : null}
					<Button
						type="button"
						variant="outline"
						size="xs"
						disabled={Boolean(disabled)}
						onClick={handleApplyAndClose}
						className="h-6 gap-1 text-xs"
					>
						<Check className="size-3" aria-hidden="true" />
						<span>{t("keyvalue_raw_done")}</span>
					</Button>
				</div>
			</div>

			<div className="relative">
				<Textarea
					value={text}
					onChange={handleTextChange}
					disabled={disabled}
					readOnly={readOnly}
					rows={8}
					aria-label={t("keyvalue_raw_title")}
					aria-invalid={Boolean(error) || undefined}
					aria-describedby={error ? alertId : undefined}
					placeholder={
						format === "json"
							? '{\n  "API_URL": "https://api.example.com",\n  "TIMEOUT": "5000"\n}'
							: "API_URL=https://api.example.com\nTIMEOUT=5000"
					}
					className="font-mono text-xs leading-relaxed"
				/>
			</div>

			{error ? (
				<Alert id={alertId} variant="destructive" className="px-2.5 py-1.5 text-xs">
					<AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
					<AlertDescription className="text-xs break-words">{error}</AlertDescription>
				</Alert>
			) : (
				<p className="text-muted-foreground text-xs">
					{format === "json" ? t("keyvalue_raw_json_hint") : t("keyvalue_raw_env_hint")}
				</p>
			)}
		</div>
	);
}
KeyValueRawEditor.displayName = "KeyValueRawEditor";
