"use client";

import { type ReactNode, useMemo } from "react";

import { AccessControlProvider, createRoleAccessEvaluator } from "@/lib/resource";

import { useAuthRole } from "../store";

/**
 * 业务层单一 RBAC 权限桥接容器（挂载于 AppProviders 内部，避免重复嵌套 AccessControlProvider）。
 * 会话校验器（SessionValidator）通过 AppProviders 的 guardSlot 单独注入。
 */
export function AuthAppBridge({ children }: { children: ReactNode }) {
  const role = useAuthRole();
  const evaluator = useMemo(() => createRoleAccessEvaluator(role), [role]);

  return <AccessControlProvider evaluator={evaluator}>{children}</AccessControlProvider>;
}
