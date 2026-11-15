"use client";

import { createContext, type CSSProperties, type ReactNode } from "react";

export interface SortableRenderBindings {
  setNodeRef: (node: HTMLElement | null) => void;
  style?: CSSProperties;
  isDragging: boolean;
  attributes: Record<string, any>;
  listeners?: Record<string, any>;
}

export const STATIC_SORTABLE_BINDINGS: SortableRenderBindings = {
  setNodeRef: () => {},
  style: undefined,
  isDragging: false,
  attributes: {},
  listeners: undefined,
};

export interface SortableSlotProps {
  id: string;
  disabled?: boolean;
  children: (bindings: SortableRenderBindings) => ReactNode;
}

export type SortableSlotRenderer = (props: SortableSlotProps) => ReactNode;

export const SortableItemContext = createContext<SortableSlotRenderer | null>(null);

/**
 * 原生数组重排纯函数：替代从 `@dnd-kit/sortable` 静态导入 `arrayMove`，确保非拖拽场景零额外打包体积。
 */
export function moveArrayItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= list.length || to >= list.length || from === to) {
    return list.slice();
  }
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved as T);
  return next;
}
