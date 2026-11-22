"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo } from "react";

import { APP_RESOURCE_LIST } from "./manifest";
import type { ResourceActionName } from "./types";

export interface AccessControlParams {
	resource: string;
	action: ResourceActionName;
	record?: unknown;
}

export type AccessControlEvaluator = (params: AccessControlParams) => boolean;

export interface AccessControlContextValue {
	can: AccessControlEvaluator;
}

/**
 * 默认权限评估器：依次校验动作级 `permissions[action]` 与资源级 `roles`。
 * - 若资源及动作均未声明角色限制，默认放行。
 * - 若声明了角色限制但当前用户无角色（`!userRole`），默认拒绝。
 */
export function createRoleAccessEvaluator(userRole?: string | null): AccessControlEvaluator {
	const policyMap = new Map(
		APP_RESOURCE_LIST.map((item) => [item.name, { roles: item.roles, permissions: item.permissions }]),
	);

	return ({ resource, action }) => {
		const policy = policyMap.get(resource);
		const allowedRoles = policy?.permissions?.[action] ?? policy?.roles;
		if (!allowedRoles?.length) {
			return true;
		}
		if (!userRole) {
			return false;
		}
		return allowedRoles.includes(userRole);
	};
}

const DEFAULT_EVALUATOR: AccessControlEvaluator = () => true;

const AccessControlContext = createContext<AccessControlContextValue>({
	can: DEFAULT_EVALUATOR,
});

export interface AccessControlProviderProps {
	evaluator?: AccessControlEvaluator;
	children: ReactNode;
}

export function AccessControlProvider({ evaluator = DEFAULT_EVALUATOR, children }: AccessControlProviderProps) {
	const can = useCallback<AccessControlEvaluator>((params) => evaluator(params), [evaluator]);
	const value = useMemo(() => ({ can }), [can]);
	return <AccessControlContext value={value}>{children}</AccessControlContext>;
}

export function useAccessControl(): AccessControlContextValue {
	return useContext(AccessControlContext);
}

/**
 * useCan:
 * 细粒度资源动作鉴权 Hook（参考 Refine AccessControlProvider）。
 * 用于统一控制新建按钮、行操作（view/edit/delete）及自定义动作的显隐。
 */
export function useCan(resource: string, action: ResourceActionName, record?: unknown): boolean {
	const { can } = useContext(AccessControlContext);
	return can({ resource, action, record });
}

export interface CanAccessProps {
	resource: string;
	action: ResourceActionName;
	record?: unknown;
	fallback?: ReactNode;
	children: ReactNode;
}

export function CanAccess({ resource, action, record, fallback = null, children }: CanAccessProps) {
	const allowed = useCan(resource, action, record);
	return allowed ? children : fallback;
}
