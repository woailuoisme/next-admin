import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMemoizedFn } from "ahooks";
import { isEqual } from "es-toolkit";
import { Code2, Plus, Table2 } from "lucide-react";
import { memo, useId, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";

import type { KeyValueInputInnerProps, KeyValueInputProps, KeyValueRowItem } from "./types";

import { FieldConnector, FieldWrapper } from "../../core";
import { KeyValueRawEditor } from "./KeyValueRawEditor";
import { KeyValueRow } from "./KeyValueRow";
import {
  createKvRow,
  findDuplicateKeys,
  markDuplicateRows,
  parseToRows,
  rowsToPairs,
  rowsToRecord,
} from "./parsers";

const EMPTY_RECORD: Record<string, string> = {};

const KeyValueInputInner = memo(function KeyValueInputInner({
  id,
  label,
  required,
  hint,
  helperText,
  tooltip,
  error,
  colSpan,
  className,
  hidden,
  disabled,
  value,
  onChange,
  onBlur,
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
  addButtonText = "添加属性",
  canAdd = true,
  canDelete = true,
  reorderable = true,
  maxItems,
  minItems = 0,
}: KeyValueInputInnerProps) {
  const [rows, setRows] = useState<KeyValueRowItem[]>(() => markDuplicateRows(parseToRows(value)));
  const [prevValue, setPrevValue] = useState(value);
  const [isRawMode, setIsRawMode] = useState(false);

  // 当外部 value 发生实质变化时同步更新
  if (value !== prevValue) {
    setPrevValue(value);
    const currentVal = Array.isArray(value) ? rowsToPairs(rows) : rowsToRecord(rows);
    if (!isEqual(value, currentVal)) {
      setRows(markDuplicateRows(parseToRows(value)));
    }
  }

  // 计算输出模式：auto 时若输入为数组则输出数组，否则输出对象
  const isArrayOutput = valueType === "array" || (valueType === "auto" && Array.isArray(value));

  const emitChange = useMemoizedFn((nextRows: KeyValueRowItem[]) => {
    const marked = markDuplicateRows(nextRows);
    setRows(marked);

    if (!onChange) return;
    if (isArrayOutput) {
      onChange(rowsToPairs(marked));
    } else {
      onChange(rowsToRecord(marked));
    }
  });

  const handleKeyChange = useMemoizedFn((rowId: string, nextKey: string) => {
    const updated = rows.map((r) => (r._id === rowId ? { ...r, key: nextKey } : r));
    emitChange(updated);
  });

  const handleValChange = useMemoizedFn((rowId: string, nextVal: string) => {
    const updated = rows.map((r) => (r._id === rowId ? { ...r, value: nextVal } : r));
    emitChange(updated);
  });

  const addPair = useMemoizedFn(() => {
    if (disabled || !canAdd) return;
    if (maxItems !== undefined && rows.length >= maxItems) return;
    const newRow = createKvRow("", "");
    emitChange([...rows, newRow]);
  });

  const removePair = useMemoizedFn((rowId: string) => {
    if (disabled || !canDelete) return;
    if (rows.length <= minItems) return;
    const updated = rows.filter((r) => r._id !== rowId);
    emitChange(updated);
  });

  // @dnd-kit 传感器与拖拽处理
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useMemoizedFn((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rows.findIndex((r) => r._id === active.id);
    const newIndex = rows.findIndex((r) => r._id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      emitChange(arrayMove(rows, oldIndex, newIndex));
    }
  });

  const duplicateKeySet = useMemo(() => findDuplicateKeys(rows), [rows]);
  const hasDuplicates = duplicateKeySet.size > 0;
  const isAddAllowed = Boolean(
    canAdd && !disabled && (maxItems === undefined || rows.length < maxItems),
  );

  const rowIds = useMemo(() => rows.map((r) => r._id), [rows]);

  return (
    <FieldWrapper
      label={label}
      id={id}
      required={required}
      hint={hint}
      helperText={helperText}
      tooltip={tooltip}
      error={error}
      colSpan={colSpan}
      className={className}
      hidden={hidden}
    >
      <TooltipProvider>
        <div className="w-full space-y-2 pt-1">
          {/* 顶栏操作区：重复键警示与 Raw 视图切换 */}
          <div className="flex min-h-6 items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {hasDuplicates && !allowDuplicateKeys ? (
                <Badge variant="destructive" className="h-5 gap-1 px-1.5 text-[10px] font-normal">
                  <span>存在 {duplicateKeySet.size} 个重复键名</span>
                </Badge>
              ) : null}
            </div>

            {enableRawMode && !disabled ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setIsRawMode((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground h-6 gap-1 text-[11px]"
              >
                {isRawMode ? (
                  <>
                    <Table2 className="size-3" />
                    <span>表格模式</span>
                  </>
                ) : (
                  <>
                    <Code2 className="size-3" />
                    <span>源码模式</span>
                  </>
                )}
              </Button>
            ) : null}
          </div>

          {/* 视图分发：Raw 源码编辑 vs 表格行编辑 */}
          {isRawMode && enableRawMode ? (
            <KeyValueRawEditor
              rows={rows}
              defaultFormat={defaultRawFormat}
              disabled={disabled}
              onChange={emitChange}
              onClose={() => setIsRawMode(false)}
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                <div className="border-border/80 bg-card overflow-hidden rounded-lg border shadow-2xs">
                  <table className="w-full caption-bottom border-collapse text-xs">
                    <thead>
                      <tr className="border-border/60 bg-muted/40 text-muted-foreground border-b font-medium select-none">
                        {reorderable && !disabled ? (
                          <th className="border-border/60 w-8 border-r px-2 py-2 text-center" />
                        ) : null}
                        <th className="border-border/60 text-muted-foreground border-r px-3 py-2 text-left font-medium">
                          {keyLabel || "Key"}
                        </th>
                        <th
                          className="text-muted-foreground px-3 py-2 text-left font-medium"
                          colSpan={canDelete && !disabled ? 2 : 1}
                        >
                          {valueLabel || "Value"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-border/40 divide-y">
                      {rows.map((row) => (
                        <KeyValueRow
                          key={row._id}
                          row={row}
                          keyPlaceholder={keyPlaceholder}
                          valuePlaceholder={valuePlaceholder}
                          keySuggestions={keySuggestions}
                          disabled={disabled}
                          canEditKeys={canEditKeys}
                          canDelete={canDelete && rows.length > minItems}
                          reorderable={reorderable}
                          masked={masked}
                          onKeyChange={handleKeyChange}
                          onValueChange={handleValChange}
                          onRemove={removePair}
                          onBlur={onBlur}
                        />
                      ))}
                    </tbody>
                  </table>

                  {/* Filament 5 官方原生一体化贯通式底部加行栏 */}
                  {isAddAllowed ? (
                    <button
                      type="button"
                      onClick={addPair}
                      className="border-border/60 bg-card text-foreground hover:bg-muted/40 active:bg-muted/60 flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 border-t px-3 text-xs font-medium transition-colors"
                    >
                      <Plus className="text-muted-foreground size-3.5" />
                      <span>{addButtonText}</span>
                    </button>
                  ) : null}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </TooltipProvider>
    </FieldWrapper>
  );
});
KeyValueInputInner.displayName = "KeyValueInputInner";

export const KeyValueInput = memo(function KeyValueInput({
  name,
  form,
  label,
  id: explicitId,
  required,
  hint,
  helperText,
  tooltip,
  error,
  colSpan,
  className,
  hidden,
  disabled,
  value: controlledValue,
  defaultValue = EMPTY_RECORD,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  valueType = "auto",
  keyPlaceholder = "键名 (Key)",
  valuePlaceholder = "键值 (Value)",
  keyLabel,
  valueLabel,
  keySuggestions,
  canEditKeys = true,
  masked = false,
  allowDuplicateKeys = false,
  enableRawMode = false,
  defaultRawFormat = "json",
  addButtonText = "添加属性",
  emptyText = "暂无键值对配置",
  canAdd = true,
  canDelete = true,
  reorderable = true,
  maxItems,
  minItems = 0,
}: KeyValueInputProps) {
  const autoId = useId();
  const id = explicitId || (name ? `field-${name}` : autoId);

  return (
    <FieldConnector<any>
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      error={error}
    >
      {({ value, onChange, onBlur, error: computedError }) => (
        <KeyValueInputInner
          id={id}
          label={label}
          required={required}
          hint={hint}
          helperText={helperText}
          tooltip={tooltip}
          error={computedError}
          colSpan={colSpan}
          className={className}
          hidden={hidden}
          disabled={disabled}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
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
    </FieldConnector>
  );
});
KeyValueInput.displayName = "KeyValueInput";
