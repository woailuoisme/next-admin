"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { ActionRuntimeResourceBridge } from "./types";

const ActionRuntimeResourceContext = createContext<ActionRuntimeResourceBridge | null>(null);

export interface ActionResourceProviderProps {
	value: ActionRuntimeResourceBridge | null;
	children: ReactNode;
}

/**
 * 注入 Resource 级动作运行时上下文（CRUD 导航、弹窗控制器、当前行集合与 ResourceDefinition）
 */
export function ActionResourceProvider({ value, children }: ActionResourceProviderProps) {
	return <ActionRuntimeResourceContext.Provider value={value}>{children}</ActionRuntimeResourceContext.Provider>;
}

/**
 * 读取当前作用域的 Resource 运行时桥接（在独立非资源页面使用时返回 null）
 */
export function useActionResourceBridge(): ActionRuntimeResourceBridge | null {
	return useContext(ActionRuntimeResourceContext);
}
