"use client";

import { isEqual } from "es-toolkit";
import { Code2, Table2 } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";

import { createContainerBlurHandler, type KeyValuePair } from "@/components/form/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { moveArrayItem } from "../sortableBinding";
import { KeyValueTable } from "./KeyValueTable";
import {
	clearDuplicateFlags,
	createKvRow,
	findDuplicateKeys,
	markDuplicateRows,
	parseToRows,
	reconcileKvRows,
	rowsToPairs,
	rowsToRecord,
} from "./parsers";
import type { KeyValueInputProps, KeyValueRowItem } from "./types";

const DynamicKeyValueRawEditor = dynamic(() => import("./KeyValueRawEditor").then((mod) => mod.KeyValueRawEditor), {
	ssr: false,
	loading: () => <Skeleton className="h-44 w-full rounded-lg" />,
});

const DynamicSortableDndContext = dynamic(() => import("../SortableDndContext").then((mod) => mod.SortableDndContext), {
	ssr: false,
	loading: () => <Skeleton className="h-24 w-full rounded-lg" />,
});

export interface KeyValueControlProps extends Omit<KeyValueInputProps, "form" | "defaultValue" | "value" | "onChange"> {
	id: string;
	readOnly?: boolean;
	value?: Record<string, string> | KeyValuePair[];
	onChange: (val: Record<string, string> | KeyValuePair[]) => void;
	onBlur?: () => void;
	hasError?: boolean;
	describedBy?: string;
}

function applyDuplicateMarking(rows: KeyValueRowItem[], allowDuplicateKeys: boolean): KeyValueRowItem[] {
	return allowDuplicateKeys ? clearDuplicateFlags(rows) : markDuplicateRows(rows);
}

export function KeyValueControl({
	id,
	disabled,
	readOnly,
	hasError,
	describedBy,
	value,
	onChange,
	onBlur,
	valueType = "auto",
	keyPlaceholder: propKeyPlaceholder,
	valuePlaceholder: propValuePlaceholder,
	keyLabel,
	valueLabel,
	keySuggestions,
	canEditKeys = true,
	masked = false,
	allowDuplicateKeys = false,
	enableRawMode = false,
	defaultRawFormat = "json",
	addButtonText: propAddButtonText,
	emptyText,
	canAdd = true,
	canDelete = true,
	reorderable = true,
	maxItems,
	minItems = 0,
}: KeyValueControlProps) {
	const t = useTranslations("form");
	const keyPlaceholder = propKeyPlaceholder ?? t("keyvalue_key_placeholder");
	const valuePlaceholder = propValuePlaceholder ?? t("keyvalue_value_placeholder");
	const addButtonText = propAddButtonText ?? t("keyvalue_add");

	const [rowsState, setRowsState] = useState<{
		rows: KeyValueRowItem[];
		lastPropValue: unknown;
		lastEmittedValue: unknown;
		allowDupes: boolean;
	}>(() => ({
		rows: applyDuplicateMarking(parseToRows(value), allowDuplicateKeys),
		lastPropValue: value,
		lastEmittedValue: value,
		allowDupes: allowDuplicateKeys,
	}));

	const [isRawMode, setIsRawMode] = useState(false);

	let rows = rowsState.rows;
	if (!isEqual(value, rowsState.lastPropValue)) {
		if (isEqual(value, rowsState.lastEmittedValue)) {
			setRowsState((prev) => ({
				...prev,
				lastPropValue: value,
			}));
		} else {
			rows = reconcileKvRows(rowsState.rows, value, allowDuplicateKeys);
			setRowsState({
				rows,
				lastPropValue: value,
				lastEmittedValue: value,
				allowDupes: allowDuplicateKeys,
			});
		}
	} else if (rowsState.allowDupes !== allowDuplicateKeys) {
		rows = applyDuplicateMarking(rowsState.rows, allowDuplicateKeys);
		setRowsState((prev) => ({
			...prev,
			rows,
			allowDupes: allowDuplicateKeys,
		}));
	}

	const isEditable = !disabled && !readOnly;
	if (!isEditable && isRawMode) {
		setIsRawMode(false);
	}

	const isArrayOutput = valueType === "array" || (valueType === "auto" && Array.isArray(value));

	const emitChange = (nextRows: KeyValueRowItem[]) => {
		const marked = applyDuplicateMarking(nextRows, allowDuplicateKeys);
		const payload = isArrayOutput ? rowsToPairs(marked) : rowsToRecord(marked);
		setRowsState((prev) => ({
			...prev,
			rows: marked,
			lastEmittedValue: payload,
		}));
		onChange(payload);
	};

	const handleRawChange = (parsedRows: KeyValueRowItem[]) => {
		let constrained = parsedRows;

		if (!canEditKeys) {
			const existingKeys = new Set(rows.map((r) => r.key.trim()).filter(Boolean));
			const incomingByKey = new Map(parsedRows.map((r) => [r.key.trim(), r.value]));
			constrained = rows.map((row) => {
				const k = row.key.trim();
				return existingKeys.has(k) && incomingByKey.has(k) ? { ...row, value: incomingByKey.get(k)! } : row;
			});
		} else {
			if (!canAdd && constrained.length > rows.length) {
				constrained = constrained.slice(0, rows.length);
			}
			if (!canDelete && constrained.length < rows.length) {
				const missingTail = rows.slice(constrained.length);
				constrained = [...constrained, ...missingTail];
			}
			if (maxItems !== undefined && constrained.length > maxItems) {
				constrained = constrained.slice(0, maxItems);
			}
			if (constrained.length < minItems) {
				while (constrained.length < minItems) {
					const fallback = rows[constrained.length];
					constrained.push(fallback ?? createKvRow("", ""));
				}
			}
		}

		emitChange(constrained);
	};

	const handleKeyChange = (rowId: string, nextKey: string) => {
		if (!isEditable || !canEditKeys) return;
		emitChange(rows.map((r) => (r._id === rowId ? { ...r, key: nextKey } : r)));
	};

	const handleValChange = (rowId: string, nextVal: string) => {
		if (!isEditable) return;
		emitChange(rows.map((r) => (r._id === rowId ? { ...r, value: nextVal } : r)));
	};

	const addPair = () => {
		if (!isEditable || !canAdd) return;
		if (maxItems !== undefined && rows.length >= maxItems) return;
		emitChange([...rows, createKvRow("", "")]);
	};

	const removePair = (rowId: string) => {
		if (!isEditable || !canDelete || rows.length <= minItems) return;
		emitChange(rows.filter((r) => r._id !== rowId));
	};

	const handleReorder = (activeId: string, overId: string) => {
		if (!isEditable || !reorderable) return;
		const oldIndex = rows.findIndex((r) => r._id === activeId);
		const newIndex = rows.findIndex((r) => r._id === overId);
		if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
			emitChange(moveArrayItem(rows, oldIndex, newIndex));
		}
	};

	const duplicateKeySet = findDuplicateKeys(rows);
	const isAddAllowed = Boolean(canAdd && isEditable && (maxItems === undefined || rows.length < maxItems));
	const rowIds = rows.map((r) => r._id);

	const tableContent = (
		<KeyValueTable
			rows={rows}
			hasError={hasError}
			isEditable={isEditable}
			reorderable={reorderable}
			canDelete={canDelete}
			canEditKeys={canEditKeys}
			masked={masked}
			minItems={minItems}
			isAddAllowed={isAddAllowed}
			disabled={disabled}
			readOnly={readOnly}
			keyLabel={keyLabel}
			valueLabel={valueLabel}
			keyPlaceholder={keyPlaceholder}
			valuePlaceholder={valuePlaceholder}
			keySuggestions={keySuggestions}
			emptyText={emptyText}
			addButtonText={addButtonText}
			onKeyChange={handleKeyChange}
			onValueChange={handleValChange}
			onRemove={removePair}
			onAdd={addPair}
		/>
	);

	return (
		<div
			id={id}
			role="group"
			aria-label={typeof keyLabel === "string" ? keyLabel : t("keyvalue_key_label")}
			aria-describedby={describedBy}
			data-invalid={hasError || undefined}
			onBlur={createContainerBlurHandler(onBlur)}
			className="flex w-full flex-col gap-2 pt-1"
		>
			{(!allowDuplicateKeys && duplicateKeySet.size > 0) || (enableRawMode && isEditable) ? (
				<div className="flex min-h-6 items-center justify-between gap-2">
					<div className="flex items-center gap-1.5">
						{duplicateKeySet.size > 0 && !allowDuplicateKeys ? (
							<Badge variant="destructive" className="h-5 gap-1 px-1.5 text-xs font-normal">
								<span>{t("keyvalue_duplicates_badge", { count: duplicateKeySet.size })}</span>
							</Badge>
						) : null}
					</div>

					{enableRawMode && isEditable ? (
						<Button
							type="button"
							variant="ghost"
							size="xs"
							onClick={() => setIsRawMode((prev) => !prev)}
							className="text-muted-foreground hover:text-foreground h-6 gap-1 text-xs"
						>
							{isRawMode ? (
								<>
									<Table2 aria-hidden="true" className="size-3" />
									<span>{t("keyvalue_table_mode")}</span>
								</>
							) : (
								<>
									<Code2 aria-hidden="true" className="size-3" />
									<span>{t("keyvalue_raw_mode")}</span>
								</>
							)}
						</Button>
					) : null}
				</div>
			) : null}

			{isRawMode && enableRawMode && isEditable ? (
				<DynamicKeyValueRawEditor
					rows={rows}
					defaultFormat={defaultRawFormat}
					disabled={disabled}
					readOnly={readOnly}
					allowDuplicateKeys={allowDuplicateKeys}
					onChange={handleRawChange}
					onClose={() => setIsRawMode(false)}
				/>
			) : reorderable && isEditable && rows.length > 0 ? (
				<DynamicSortableDndContext items={rowIds} onReorder={handleReorder}>
					{tableContent}
				</DynamicSortableDndContext>
			) : (
				tableContent
			)}
		</div>
	);
}
KeyValueControl.displayName = "KeyValueControl";
