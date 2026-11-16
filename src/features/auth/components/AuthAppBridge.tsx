"use client";

import { type ReactNode, useEffect, useMemo } from "react";

import { AccessControlProvider, createRoleAccessEvaluator } from "@/lib/resource";

import { subscribeAuthStorageSync, useAuthRole, useAuthStore } from "../store";

/**
 * 业务层单一 RBAC 权限桥接容器（挂载于 AppProviders 内部，避免重复嵌套 AccessControlProvider）。
 * 同步负责客户端 mount 后的持久化会话水合与跨标签页存储事件订阅，确保 SSR 与首帧渲染完全一致。
 * 会话校验器（SessionValidator）通过 AppProviders 的 guardSlot 单独注入。
 */
export function AuthAppBridge({ children }: { children: ReactNode }) {
  const role = useAuthRole();
  const evaluator = useMemo(() => createRoleAccessEvaluator(role), [role]);

  useEffect(() => {
    void useAuthStore.persist.rehydrate();
    return subscribeAuthStorageSync();
  }, []);

  return <AccessControlProvider evaluator={evaluator}>{children}</AccessControlProvider>;
}
