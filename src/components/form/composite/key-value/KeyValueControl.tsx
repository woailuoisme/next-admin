"use client";

import { useMemoizedFn } from "ahooks";
import { isEqual } from "es-toolkit";
import { Code2, Table2 } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { createContainerBlurHandler, type KeyValuePair } from "../../core";
import { moveArrayItem } from "../sortableBinding";
import { KeyValueTable } from "./KeyValueTable";
import {
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
});

const DynamicSortableDndContext = dynamic(() => import("../SortableDndContext").then((mod) => mod.SortableDndContext), {
	ssr: false,
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
	const [rows, setRows] = useState<KeyValueRowItem[]>(() => markDuplicateRows(parseToRows(value)));
	const [isRawMode, setIsRawMode] = useState(false);

	const lastEmittedRef = useRef<unknown>(value);

	useEffect(() => {
		if (isEqual(value, lastEmittedRef.current)) return;
		lastEmittedRef.current = value;
		setRows((prev) => reconcileKvRows(prev, value));
	}, [value]);

	const isArrayOutput = valueType === "array" || (valueType === "auto" && Array.isArray(value));

	const emitChange = useMemoizedFn((nextRows: KeyValueRowItem[]) => {
		const marked = markDuplicateRows(nextRows);
		setRows(marked);
		const payload = isArrayOutput ? rowsToPairs(marked) : rowsToRecord(marked);
		lastEmittedRef.current = payload;
		onChange(payload);
	});

	const handleKeyChange = useMemoizedFn((rowId: string, nextKey: string) => {
		emitChange(rows.map((r) => (r._id === rowId ? { ...r, key: nextKey } : r)));
	});

	const handleValChange = useMemoizedFn((rowId: string, nextVal: string) => {
		emitChange(rows.map((r) => (r._id === rowId ? { ...r, value: nextVal } : r)));
	});

	const addPair = useMemoizedFn(() => {
		if (disabled || readOnly || !canAdd) return;
		if (maxItems !== undefined && rows.length >= maxItems) return;
		emitChange([...rows, createKvRow("", "")]);
	});

	const removePair = useMemoizedFn((rowId: string) => {
		if (disabled || readOnly || !canDelete || rows.length <= minItems) return;
		emitChange(rows.filter((r) => r._id !== rowId));
	});

	const handleReorder = useMemoizedFn((activeId: string, overId: string) => {
		if (disabled || readOnly || !reorderable) return;
		const oldIndex = rows.findIndex((r) => r._id === activeId);
		const newIndex = rows.findIndex((r) => r._id === overId);
		if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
			emitChange(moveArrayItem(rows, oldIndex, newIndex));
		}
	});

	const duplicateKeySet = findDuplicateKeys(rows);
	const isEditable = !disabled && !readOnly;
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
			aria-describedby={describedBy}
			data-invalid={hasError || undefined}
			onBlur={createContainerBlurHandler(onBlur)}
			className="w-full space-y-2 pt-1"
		>
			<div className="flex min-h-6 items-center justify-between gap-2">
				<div className="flex items-center gap-1.5">
					{duplicateKeySet.size > 0 && !allowDuplicateKeys ? (
						<Badge variant="destructive" className="h-5 gap-1 px-1.5 text-[10px] font-normal">
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
						className="text-muted-foreground hover:text-foreground h-6 gap-1 text-[11px]"
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

			{isRawMode && enableRawMode ? (
				<DynamicKeyValueRawEditor
					rows={rows}
					defaultFormat={defaultRawFormat}
					disabled={disabled}
					onChange={emitChange}
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
