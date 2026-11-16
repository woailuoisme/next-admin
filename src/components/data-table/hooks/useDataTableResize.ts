"use client";

import { useLatest, useMemoizedFn } from "ahooks";
import { clamp } from "es-toolkit";
import { useEffect, useMemo, useRef, useState } from "react";

import { useIsHydrated } from "@/hooks/useIsHydrated";
import { EMPTY_RECORD } from "../core/constants";
import type { DataTableColDef, DataTablePinnedColumns } from "../core/types";
import { toColumnCssVarKey } from "../core/utils";
import { computePinningOffsets, resolvePinnedFields } from "./useDataTablePinning";

function readStoredColumnWidths(storageKey?: string): Record<string, number> {
  if (!storageKey || typeof window === "undefined") {
    return EMPTY_RECORD;
  }
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? (JSON.parse(saved) as Record<string, number>) : EMPTY_RECORD;
  } catch {
    return EMPTY_RECORD;
  }
}

export interface UseDataTableResizeOptions<TData = unknown> {
  columns: DataTableColDef<TData>[];
  storageKey?: string;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  pinnedColumns?: DataTablePinnedColumns;
  checkboxSelection?: boolean;
  hasExpandColumn?: boolean;
}

export function useDataTableResize<TData = unknown>({
  columns,
  storageKey,
  containerRef,
  pinnedColumns = EMPTY_RECORD,
  checkboxSelection = false,
  hasExpandColumn = false,
}: UseDataTableResizeOptions<TData>) {
  const isHydrated = useIsHydrated();
  const storedWidths = useMemo(
    () => (isHydrated ? readStoredColumnWidths(storageKey) : EMPTY_RECORD),
    [isHydrated, storageKey],
  );
  const [overrideState, setOverrideState] = useState<{
    key: string | undefined;
    widths: Record<string, number>;
  } | null>(null);
  const columnWidths = overrideState && overrideState.key === storageKey ? overrideState.widths : storedWidths;
  const setColumnWidths = useMemoizedFn(
    (next: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
      setOverrideState((prev) => {
        const baseWidths = prev && prev.key === storageKey ? prev.widths : storedWidths;
        const resolved = typeof next === "function" ? next(baseWidths) : next;
        return { key: storageKey, widths: resolved };
      });
    },
  );

  const columnByField = useMemo(() => new Map(columns.map((c) => [c.field, c])), [columns]);

  const { pinnedLeftFields, pinnedRightFields } = useMemo(
    () => resolvePinnedFields(columns, pinnedColumns),
    [columns, pinnedColumns],
  );

  const latestRef = useLatest({
    columnWidths,
    columnByField,
    pinnedLeftFields,
    pinnedRightFields,
    checkboxSelection,
    hasExpandColumn,
  });

  const resizingColRef = useRef<{
    field: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const activeDragCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      activeDragCleanupRef.current?.();
      activeDragCleanupRef.current = null;
    };
  }, []);

  // Persist to storage whenever columnWidths change
  const persistWidths = useMemoizedFn((widths: Record<string, number>) => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(widths));
    } catch {
      // Ignore storage quota or security errors
    }
  });

  const getColumnWidth = useMemoizedFn((field: string, fallbackWidth = 120) => {
    return latestRef.current.columnWidths[field] ?? latestRef.current.columnByField.get(field)?.width ?? fallbackWidth;
  });

  /** 键盘步进调整列宽（列宽手柄左右方向键），与拖拽共用同一份宽度状态与持久化 */
  const handleResizeStep = useMemoizedFn((field: string, delta: number) => {
    const { columnWidths: currentWidths, columnByField: colMap } = latestRef.current;
    const col = colMap.get(field);
    const baseWidth = currentWidths[field] ?? col?.width ?? 120;
    const nextWidths = {
      ...currentWidths,
      [field]: clamp(baseWidth + delta, col?.minWidth ?? 50, col?.maxWidth ?? 9999),
    };
    setColumnWidths(nextWidths);
    persistWidths(nextWidths);
  });

  const handleResizeStart = useMemoizedFn((field: string, initialWidth: number, e: React.MouseEvent) => {
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
    } = latestRef.current;

    resizingColRef.current = {
      field,
      startX: e.clientX,
      startWidth: currentWidths[field] ?? initialWidth,
    };

    const targetCol = colMap.get(field);
    const minWidth = targetCol?.minWidth ?? 50;
    const maxWidth = targetCol?.maxWidth ?? 9999;

    let rafId: number | null = null;
    let latestWidths: Record<string, number> = { ...currentWidths };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingColRef.current) return;
      const delta = moveEvent.clientX - resizingColRef.current.startX;
      const newWidth = clamp(resizingColRef.current.startWidth + delta, minWidth, maxWidth);
      const targetField = resizingColRef.current.field;
      latestWidths = {
        ...latestWidths,
        [targetField]: newWidth,
      };

      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const containerEl = containerRef?.current;
        if (containerEl) {
          containerEl.style.setProperty(`--col-w-${toColumnCssVarKey(targetField)}`, `${newWidth}px`);
          if (leftFields.length > 0 || rightFields.length > 0) {
            const { leftOffsets, rightOffsets } = computePinningOffsets({
              pinnedLeftFields: leftFields,
              pinnedRightFields: rightFields,
              columnByField: colMap,
              columnWidths: latestWidths,
              checkboxSelection: hasCheckbox,
              hasExpandColumn: hasExpand,
            });
            for (const f of leftFields) {
              containerEl.style.setProperty(`--col-left-${toColumnCssVarKey(f)}`, `${leftOffsets[f]}px`);
            }
            for (const f of rightFields) {
              containerEl.style.setProperty(`--col-right-${toColumnCssVarKey(f)}`, `${rightOffsets[f]}px`);
            }
          }
        } else {
          setColumnWidths(latestWidths);
        }
      });
    };

    const detachListeners = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
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

  return {
    columnWidths,
    setColumnWidths,
    getColumnWidth,
    handleResizeStart,
    handleResizeStep,
    resetColumnWidths,
  };
}
