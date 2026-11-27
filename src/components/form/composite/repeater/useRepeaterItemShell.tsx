"use client";

import type { RepeaterItemHelpers } from "./types";

interface UseRepeaterItemShellOptions<T> {
	itemKey: string;
	index: number;
	totalItems: number;
	isCollapsed?: boolean;
	error?: string | string[];
	onToggleCollapse?: (key: string) => void;
	onMoveUp: (index: number) => void;
	onMoveDown: (index: number) => void;
	onDuplicate: (index: number) => void;
	onRemove: (index: number) => void;
	onUpdate: (nextVal: T, index: number) => void;
}

const NOOP = () => {};

/**
 * 统一封装 Repeater 卡片行与表格行的稳定 helpers 与行级操作回调，消除双行视图重复实现。
 */
export function useRepeaterItemShell<T>({
	itemKey,
	index,
	totalItems,
	isCollapsed = false,
	error,
	onToggleCollapse,
	onMoveUp,
	onMoveDown,
	onDuplicate,
	onRemove,
	onUpdate,
}: UseRepeaterItemShellOptions<T>) {
	const handleToggle = () => {
		onToggleCollapse?.(itemKey);
	};

	const handleMoveUp = () => {
		onMoveUp(index);
	};

	const handleMoveDown = () => {
		onMoveDown(index);
	};

	const handleDuplicate = () => {
		onDuplicate(index);
	};

	const handleDirectRemove = () => {
		onRemove(index);
	};

	const handleUpdate = (nextVal: T) => {
		onUpdate(nextVal, index);
	};

	const hasError = Boolean(error && (Array.isArray(error) ? error.length > 0 : true));
	const isFirst = index === 0;
	const isLast = index === totalItems - 1;

	const helpers: RepeaterItemHelpers<T> = {
		index,
		totalItems,
		isFirst,
		isLast,
		isCollapsed,
		hasError,
		error,
		moveUp: handleMoveUp,
		moveDown: handleMoveDown,
		remove: handleDirectRemove,
		duplicate: handleDuplicate,
		toggleCollapse: onToggleCollapse ? handleToggle : NOOP,
		update: handleUpdate,
	};

	return {
		hasError,
		isFirst,
		isLast,
		helpers,
		handleToggle,
		handleMoveUp,
		handleMoveDown,
		handleDuplicate,
		handleDirectRemove,
		handleUpdate,
	};
}
