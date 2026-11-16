"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { isEqual } from "es-toolkit";
import { Code2, Plus, Table2 } from "lucide-react";
import { memo, type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "cn";

import type { KeyValueInputProps, KeyValueRowItem } from "./types";

import { createContainerBlurHandler, FormFieldEngine, type KeyValuePair } from "../../core";
import { moveArrayItem } from "../sortableBinding";
import { KeyValueRow } from "./KeyValueRow";
import {
  createKvRow,
  findDuplicateKeys,
  markDuplicateRows,
  parseToRows,
  reconcileKvRows,
  rowsToPairs,
  rowsToRecord,
} from "./parsers";

const DynamicKeyValueRawEditor = dynamic(() => import("./KeyValueRawEditor").then((mod) => mod.KeyValueRawEditor), {
  ssr: false,
});

const DynamicSortableDndContext = dynamic(() => import("../SortableDndContext").then((mod) => mod.SortableDndContext), {
  ssr: false,
});

const EMPTY_RECORD: Record<string, string> = {};

interface KeyValueControlProps extends Omit<KeyValueInputProps, "form" | "defaultValue" | "value" | "onChange"> {
  id: string;
  readOnly?: boolean;
  value?: Record<string, string> | KeyValuePair[];
  onChange: (val: Record<string, string> | KeyValuePair[]) => void;
  onBlur?: () => void;
  hasError?: boolean;
  describedBy?: string;
}

const KeyValueControl = memo(function KeyValueControl({
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

  // 记录组件内部最近一次向外提交的归一化值，仅在外部发生真实重置/覆盖时增量对账行集
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
    if (disabled || readOnly || !canDelete) return;
    if (rows.length <= minItems) return;
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

  const duplicateKeySet = useMemo(() => findDuplicateKeys(rows), [rows]);
  const hasDuplicates = duplicateKeySet.size > 0;
  const isEditable = !disabled && !readOnly;
  const isAddAllowed = Boolean(canAdd && isEditable && (maxItems === undefined || rows.length < maxItems));
  const rowIds = useMemo(() => rows.map((r) => r._id), [rows]);
  const dndActive = Boolean(reorderable && isEditable && rows.length > 0);
  const tableColCount = 2 + (reorderable && isEditable ? 1 : 0) + (canDelete && isEditable ? 1 : 0);

  const tableContent: ReactNode = (
    <div
      className={cn(
        "border-border/80 bg-card overflow-hidden rounded-lg border shadow-2xs",
        hasError && "border-destructive",
      )}
    >
      <Table className="text-xs">
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted/40 border-b font-medium select-none">
            {reorderable && isEditable ? (
              <TableHead className="border-border/60 w-8 border-r px-2 py-2 text-center" />
            ) : null}
            <TableHead className="border-border/60 text-muted-foreground border-r px-3 py-2 text-left font-medium">
              {keyLabel || t("keyvalue_key_label")}
            </TableHead>
            <TableHead
              className="text-muted-foreground px-3 py-2 text-left font-medium"
              colSpan={canDelete && isEditable ? 2 : 1}
            >
              {valueLabel || t("keyvalue_value_label")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-border/40 divide-y">
          {rows.length === 0 && emptyText ? (
            <TableRow>
              <TableCell colSpan={tableColCount} className="text-muted-foreground py-6 text-center text-xs">
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <KeyValueRow
                key={row._id}
                row={row}
                keyPlaceholder={keyPlaceholder}
                valuePlaceholder={valuePlaceholder}
                keySuggestions={keySuggestions}
                disabled={disabled}
                readOnly={readOnly}
                canEditKeys={canEditKeys}
                canDelete={canDelete && rows.length > minItems}
                reorderable={reorderable}
                masked={masked}
                onKeyChange={handleKeyChange}
                onValueChange={handleValChange}
                onRemove={removePair}
              />
            ))
          )}
        </TableBody>
      </Table>

      {isAddAllowed ? (
        <Button
          type="button"
          variant="ghost"
          onClick={addPair}
          className="border-border/60 bg-card text-foreground hover:bg-muted/40 active:bg-muted/60 h-9 w-full rounded-none border-t px-3 text-xs font-medium"
        >
          <Plus aria-hidden="true" className="text-muted-foreground size-3.5" />
          <span>{addButtonText}</span>
        </Button>
      ) : null}
    </div>
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
      {/* 顶栏操作区：重复键警示与 Raw 视图切换 */}
      <div className="flex min-h-6 items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {hasDuplicates && !allowDuplicateKeys ? (
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
      ) : dndActive ? (
        <DynamicSortableDndContext items={rowIds} onReorder={handleReorder}>
          {tableContent}
        </DynamicSortableDndContext>
      ) : (
        tableContent
      )}
    </div>
  );
});
KeyValueControl.displayName = "KeyValueControl";

export const KeyValueInput = memo(function KeyValueInput({
  defaultValue = EMPTY_RECORD,
  valueType = "auto",
  keyPlaceholder,
  valuePlaceholder,
  keyLabel,
  valueLabel,
  keySuggestions,
  canEditKeys = true,
  masked = false,
  allowDuplicateKeys = false,
  enableRawMode = false,
  defaultRawFormat = "json",
  addButtonText,
  emptyText,
  canAdd = true,
  canDelete = true,
  reorderable = true,
  maxItems,
  minItems = 0,
  ...fieldProps
}: KeyValueInputProps) {
  return (
    <FormFieldEngine<Record<string, string> | KeyValuePair[]> defaultValue={defaultValue} {...fieldProps}>
      {({ id, value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => (
        <KeyValueControl
          id={id}
          disabled={isDisabled}
          readOnly={isReadOnly}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          hasError={hasError}
          describedBy={describedBy}
          valueType={valueType}
          keyPlaceholder={keyPlaceholder}
          valuePlaceholder={valuePlaceholder}
          keyLabel={keyLabel}
          valueLabel={valueLabel}
          keySuggestions={keySuggestions}
          canEditKeys={canEditKeys}
          masked={masked}
          allowDuplicateKeys={allowDuplicateKeys}
          enableRawMode={enableRawMode}
          defaultRawFormat={defaultRawFormat}
          addButtonText={addButtonText}
          emptyText={emptyText}
          canAdd={canAdd}
          canDelete={canDelete}
          reorderable={reorderable}
          maxItems={maxItems}
          minItems={minItems}
        />
      )}
    </FormFieldEngine>
  );
});
KeyValueInput.displayName = "KeyValueInput";
