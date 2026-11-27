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
import type { ReactNode } from "react";

import { SortableItemContext, type SortableSlotProps } from "./sortableBinding";

const VERTICAL_MODIFIERS = [restrictToVerticalAxis];
const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 5 } };
const KEYBOARD_SENSOR_OPTIONS = { coordinateGetter: sortableKeyboardCoordinates };

function DndSortableItemBinding({ id, disabled, children }: SortableSlotProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return <>{children({ setNodeRef, style, isDragging, attributes, listeners })}</>;
}

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
		useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
		useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		onReorder(String(active.id), String(over.id));
	};

	return (
		<SortableItemContext value={renderDndSortableSlot}>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				modifiers={VERTICAL_MODIFIERS}
				onDragEnd={handleDragEnd}
			>
				<SortableContext items={items} strategy={verticalListSortingStrategy}>
					{children}
				</SortableContext>
			</DndContext>
		</SortableItemContext>
	);
}
