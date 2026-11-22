import { type ComponentType, createElement, isValidElement, type ReactNode } from "react";

export type IconComponentType = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

/**
 * 判断值是否包含可渲染内容（兼容数字 `0`，过滤 `null`/`undefined`/`false`/`""`）
 */
export function hasRenderableNode(node: unknown): boolean {
	return node !== null && node !== undefined && node !== false && node !== "";
}

/**
 * 判断值是否为 React 组件引用（函数组件、memo/forwardRef 包装对象）而非已实例化的 JSX 元素
 */
export function isComponentReference(value: unknown): value is IconComponentType {
	if (typeof value === "function") return true;
	if (typeof value === "object" && value !== null && !isValidElement(value)) {
		return "$$typeof" in value;
	}
	return false;
}

/**
 * 统一渲染支持「组件引用 | ReactNode」的图标槽位
 */
export function renderIconSlot(icon: ReactNode | IconComponentType | null | undefined, className?: string): ReactNode {
	if (!hasRenderableNode(icon) || typeof icon === "boolean") return null;
	if (isComponentReference(icon)) {
		return createElement(icon, { className, "aria-hidden": true });
	}
	return icon;
}
