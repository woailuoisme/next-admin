import { useMemoizedFn } from "ahooks";
import { clamp } from "es-toolkit";
import { useRef, useState } from "react";

import { EMPTY_RECORD } from "../core/constants";
import type { DataTableColDef } from "../core/types";

export interface UseDataTableResizeOptions<TData = any> {
  columns: DataTableColDef<TData>[];
  storageKey?: string;
}

export function useDataTableResize<TData = any>({ columns, storageKey }: UseDataTableResizeOptions<TData>) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    if (!storageKey || typeof window === "undefined") {
      return EMPTY_RECORD;
    }
    try {
      const saved = window.localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : EMPTY_RECORD;
    } catch {
      return EMPTY_RECORD;
    }
  });

  const resizingColRef = useRef<{
    field: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  // Persist to storage whenever columnWidths change
  const persistWidths = useMemoizedFn((widths: Record<string, number>) => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(widths));
    } catch {
      // Ignore storage quota or security errors
    }
  });

  const handleResizeStart = useMemoizedFn((field: string, initialWidth: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    resizingColRef.current = {
      field,
      startX: e.clientX,
      startWidth: columnWidths[field] ?? initialWidth,
    };

    const targetCol = columns.find((c) => c.field === field);
    const minWidth = targetCol?.minWidth ?? 50;
    const maxWidth = targetCol?.maxWidth ?? 9999;

    let rafId: number | null = null;
    let latestWidths: Record<string, number> = columnWidths;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingColRef.current) return;
      const delta = moveEvent.clientX - resizingColRef.current.startX;
      const newWidth = clamp(resizingColRef.current.startWidth + delta, minWidth, maxWidth);
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setColumnWidths((prev) => {
          const updated = {
            ...prev,
            [resizingColRef.current!.field]: newWidth,
          };
          latestWidths = updated;
          return updated;
        });
      });
    };

    const handleMouseUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizingColRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      persistWidths(latestWidths);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  });

  const resetColumnWidths = useMemoizedFn(() => {
    setColumnWidths({});
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
    handleResizeStart,
    resetColumnWidths,
  };
}
