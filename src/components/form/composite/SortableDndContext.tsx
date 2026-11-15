"use client";

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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemoizedFn } from "ahooks";
import { memo, type ReactNode, useMemo } from "react";

import { SortableItemContext, type SortableSlotProps } from "./sortableBinding";

const DndSortableItemBinding = memo(function DndSortableItemBinding({ id, disabled, children }: SortableSlotProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition],
  );

  return <>{children({ setNodeRef, style, isDragging, attributes, listeners })}</>;
});

function renderDndSortableSlot(props: SortableSlotProps) {
  return <DndSortableItemBinding {...props} />;
}

export interface SortableDndContextProps {
  items: string[];
  onReorder: (activeId: string, overId: string) => void;
  children: ReactNode;
}

/**
 * 按需加载的垂直拖拽容器：仅在 `reorderable && !disabled` 时通过 `next/dynamic` 引入 `@dnd-kit/core` 与 modifiers。
 */
export function SortableDndContext({ items, onReorder, children }: SortableDndContextProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useMemoizedFn((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  });

  return (
    <SortableItemContext value={renderDndSortableSlot}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </DndContext>
    </SortableItemContext>
  );
}
