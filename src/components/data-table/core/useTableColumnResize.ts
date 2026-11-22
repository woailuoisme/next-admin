"use client";

import { useLatest, useMemoizedFn } from "ahooks";
import { clamp } from "es-toolkit";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useIsHydrated } from "@/hooks/useIsHydrated";

import { EMPTY_RECORD } from "./constants";
import { computePinningOffsets, resolvePinnedFields } from "./tableEngineHelpers";
import type { DataTableColDef, DataTablePinnedColumns } from "./types";
import { toColumnCssVarKey } from "./utils";

function readStoredColumnWidths(storageKey?: string): Record<string, number> {
  if (!storageKey || typeof window === "undefined") return EMPTY_RECORD;
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? (JSON.parse(saved) as Record<string, number>) : EMPTY_RECORD;
  } catch {
    return EMPTY_RECORD;
  }
}

export interface UseTableColumnResizeOptions<TData extends Record<string, any>> {
  visibleColumns: DataTableColDef<TData>[];
  visibleColumnByField: Map<string, DataTableColDef<TData>>;
  pinnedColumns: DataTablePinnedColumns;
  checkboxSelection: boolean;
  hasExpandColumn: boolean;
  storageKey?: string;
  containerRef?: RefObject<HTMLDivElement | null>;
}

/**
 * 数据表格 60fps rAF CSS 变量列宽拖拽、键盘步进调整、Sticky 固定列偏移与 localStorage 持久化。
 */
export function useTableColumnResize<TData extends Record<string, any>>({
  visibleColumns,
  visibleColumnByField,
  pinnedColumns,
  checkboxSelection,
  hasExpandColumn,
  storageKey,
  containerRef,
}: UseTableColumnResizeOptions<TData>) {
  "use no memo";

  const isHydrated = useIsHydrated();
  const storedWidths = isHydrated ? readStoredColumnWidths(storageKey) : EMPTY_RECORD;
  const [widthOverrideState, setWidthOverrideState] = useState<{
    key: string | undefined;
    widths: Record<string, number>;
  } | null>(null);
  const columnWidths =
    widthOverrideState && widthOverrideState.key === storageKey ? widthOverrideState.widths : storedWidths;

  const setColumnWidths = useMemoizedFn(
    (next: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
      setWidthOverrideState((prev) => {
        const baseWidths = prev && prev.key === storageKey ? prev.widths : storedWidths;
        return { key: storageKey, widths: typeof next === "function" ? next(baseWidths) : next };
      });
    },
  );

  const persistWidths = useMemoizedFn((widths: Record<string, number>) => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(widths));
    } catch {
      // Ignore storage quota or security errors
    }
  });

  const { pinnedLeftFields, pinnedRightFields } = useMemo(
    () => resolvePinnedFields(visibleColumns, pinnedColumns),
    [visibleColumns, pinnedColumns],
  );
  const { leftOffsets, rightOffsets } = useMemo(
    () =>
      computePinningOffsets({
        pinnedLeftFields,
        pinnedRightFields,
        columnByField: visibleColumnByField,
        columnWidths,
        checkboxSelection,
        hasExpandColumn,
      }),
    [pinnedLeftFields, pinnedRightFields, visibleColumnByField, columnWidths, checkboxSelection, hasExpandColumn],
  );

  const resizeLatestRef = useLatest({
    columnWidths,
    columnByField: visibleColumnByField,
    pinnedLeftFields,
    pinnedRightFields,
    checkboxSelection,
    hasExpandColumn,
  });
  const resizingColRef = useRef<{ field: string; startX: number; startWidth: number } | null>(null);
  const activeDragCleanupRef = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      activeDragCleanupRef.current?.();
      activeDragCleanupRef.current = null;
    },
    [],
  );

  const getColumnWidth = useMemoizedFn((field: string, fallbackWidth = 120) => {
    return (
      resizeLatestRef.current.columnWidths[field] ??
      resizeLatestRef.current.columnByField.get(field)?.width ??
      fallbackWidth
    );
  });

  const handleResizeStep = useMemoizedFn((field: string, delta: number) => {
    const { columnWidths: currentWidths, columnByField: colMap } = resizeLatestRef.current;
    const col = colMap.get(field);
    const baseWidth = currentWidths[field] ?? col?.width ?? 120;
    const nextWidths = {
      ...currentWidths,
      [field]: clamp(baseWidth + delta, col?.minWidth ?? 50, col?.maxWidth ?? 9999),
    };
    setColumnWidths(nextWidths);
    persistWidths(nextWidths);
  });

  const handleResizeStart = useMemoizedFn((field: string, initialWidth: number, e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    activeDragCleanupRef.current?.();

    const {
      columnWidths: currentWidths,
      columnByField: colMap,
      pinnedLeftFields: leftFields,
      pinnedRightFields: rightFields,
      checkboxSelection: hasCheckbox,
      hasExpandColumn: hasExpand,
    } = resizeLatestRef.current;

    resizingColRef.current = { field, startX: e.clientX, startWidth: currentWidths[field] ?? initialWidth };
    const targetCol = colMap.get(field);
    const minWidth = targetCol?.minWidth ?? 50;
    const maxWidth = targetCol?.maxWidth ?? 9999;

    let rafId: number | null = null;
    let latestWidths: Record<string, number> = { ...currentWidths };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingColRef.current) return;
      const newWidth = clamp(
        resizingColRef.current.startWidth + (moveEvent.clientX - resizingColRef.current.startX),
        minWidth,
        maxWidth,
      );
      const targetField = resizingColRef.current.field;
      latestWidths = { ...latestWidths, [targetField]: newWidth };

      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const containerEl = containerRef?.current;
        if (!containerEl) {
          setColumnWidths(latestWidths);
          return;
        }
        containerEl.style.setProperty(`--col-w-${toColumnCssVarKey(targetField)}`, `${newWidth}px`);
        if (leftFields.length > 0 || rightFields.length > 0) {
          const offsets = computePinningOffsets({
            pinnedLeftFields: leftFields,
            pinnedRightFields: rightFields,
            columnByField: colMap,
            columnWidths: latestWidths,
            checkboxSelection: hasCheckbox,
            hasExpandColumn: hasExpand,
          });
          for (const f of leftFields) {
            containerEl.style.setProperty(`--col-left-${toColumnCssVarKey(f)}`, `${offsets.leftOffsets[f]}px`);
          }
          for (const f of rightFields) {
            containerEl.style.setProperty(`--col-right-${toColumnCssVarKey(f)}`, `${offsets.rightOffsets[f]}px`);
          }
        }
      });
    };

    const detachListeners = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      resizingColRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      activeDragCleanupRef.current = null;
    };

    const handleMouseUp = () => {
      detachListeners();
      setColumnWidths(latestWidths);
      persistWidths(latestWidths);
    };

    activeDragCleanupRef.current = detachListeners;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  });

  const resetColumnWidths = useMemoizedFn(() => {
    setColumnWidths(EMPTY_RECORD);
    if (storageKey && typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // Ignore storage errors
      }
    }
  });

  const containerColumnStyles: Record<string, string> = {};
  for (const col of visibleColumns) {
    const varKey = toColumnCssVarKey(col.field);
    const w = columnWidths[col.field] ?? col.width;
    if (w !== undefined) containerColumnStyles[`--col-w-${varKey}`] = `${w}px`;
    if (leftOffsets[col.field] !== undefined)
      containerColumnStyles[`--col-left-${varKey}`] = `${leftOffsets[col.field]}px`;
    if (rightOffsets[col.field] !== undefined)
      containerColumnStyles[`--col-right-${varKey}`] = `${rightOffsets[col.field]}px`;
  }

  return {
    columnWidths,
    setColumnWidths,
    getColumnWidth,
    handleResizeStart,
    handleResizeStep,
    resetColumnWidths,
    pinnedLeftFields,
    pinnedRightFields,
    leftOffsets,
    rightOffsets,
    containerColumnStyles: containerColumnStyles as CSSProperties,
  };
}
