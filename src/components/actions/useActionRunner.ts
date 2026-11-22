"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMemoizedFn } from "ahooks";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { invalidateResourceScope } from "@/lib/resource";

import { useActionResourceBridge } from "./context";
import type { ActionDef, ActionRunContext } from "./types";
import { resolveActionValue } from "./utils";

export interface ActiveActionSession<TPayload = any> {
  action: ActionDef<TPayload, any>;
  payload: TPayload;
  mode: "confirm" | "modal" | "import" | "export";
  clearSelection?: () => void;
}

/**
 * 统一 Action 执行器 Hook：
 * 管理触发分发（直连执行 / URL 导航 / Confirm 弹窗 / Form Modal / SlideOver / 内容 Modal / Import & Export）、
 * 生命周期钩子（before -> handler -> after）、并发防重入锁、Toast 反馈与 Query 缓存失效。
 */
export function useActionRunner<TPayload = any>() {
  const t = useTranslations("actions");
  const queryClient = useQueryClient();
  const router = useRouter();
  const resourceBridge = useActionResourceBridge();

  const [activeSession, setActiveSession] = useState<ActiveActionSession<TPayload> | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const lockRef = useRef(false);

  const closeSession = useMemoizedFn(() => {
    setActiveSession(null);
  });

  const executeAction = useMemoizedFn(
    async (
      action: ActionDef<TPayload, any>,
      payload: TPayload,
      formData: Record<string, unknown> = {},
      clearSelection?: () => void,
    ) => {
      if (lockRef.current) return;
      lockRef.current = true;
      setPendingActionId(action.id);

      const ctx: ActionRunContext<TPayload, Record<string, unknown>> = {
        payload,
        data: formData,
        closeModal: closeSession,
        clearSelection,
        queryClient,
        resourceBridge,
      };

      try {
        if (action.before) {
          const shouldContinue = await action.before(ctx);
          if (shouldContinue === false) {
            return;
          }
        }

        const result = action.handler ? await action.handler(ctx) : undefined;

        if (resourceBridge) {
          invalidateResourceScope(queryClient, resourceBridge.resource, action.invalidates);
        } else if (action.invalidates?.length) {
          await Promise.all(action.invalidates.map((key) => queryClient.invalidateQueries({ queryKey: [...key] })));
        }

        if (action.after) {
          await action.after({ ...ctx, result });
        }

        if (action.successMessage) {
          const msg =
            typeof action.successMessage === "function" ? action.successMessage(result, ctx) : action.successMessage;
          if (msg) toast.success(msg);
        }

        if (action.autoClearSelection !== false) {
          clearSelection?.();
        }
      } catch (error) {
        if (action.errorMessage) {
          const msg = typeof action.errorMessage === "function" ? action.errorMessage(error, ctx) : action.errorMessage;
          if (msg) toast.error(msg);
        } else {
          toast.error(t("error"));
        }
        throw error;
      } finally {
        lockRef.current = false;
        setPendingActionId(null);
      }
    },
  );

  const triggerAction = useMemoizedFn(
    (action: ActionDef<TPayload, any>, payload: TPayload, options?: { clearSelection?: () => void }) => {
      if (resolveActionValue(action.disabled, payload)) return;

      const href = resolveActionValue(action.href, payload);
      if (href) {
        if (action.openInNewTab) {
          window.open(href, "_blank", "noopener,noreferrer");
        } else {
          router.push(href);
        }
        return;
      }

      if (action.builtinModal?.kind === "export") {
        setActiveSession({
          action,
          payload,
          mode: "export",
          clearSelection: options?.clearSelection,
        });
        return;
      }

      if (action.builtinModal?.kind === "import") {
        setActiveSession({
          action,
          payload,
          mode: "import",
          clearSelection: options?.clearSelection,
        });
        return;
      }

      const resolvedModal = resolveActionValue(action.modal, payload);
      if (resolvedModal) {
        setActiveSession({
          action,
          payload,
          mode: "modal",
          clearSelection: options?.clearSelection,
        });
        return;
      }

      if (action.confirm) {
        setActiveSession({
          action,
          payload,
          mode: "confirm",
          clearSelection: options?.clearSelection,
        });
        return;
      }

      void executeAction(action, payload, {}, options?.clearSelection).catch(() => {
        // Error toast already surfaced inside executeAction
      });
    },
  );

  return {
    activeSession,
    pendingActionId,
    isPending: Boolean(pendingActionId),
    resourceBridge,
    triggerAction,
    executeAction,
    closeSession,
  };
}
