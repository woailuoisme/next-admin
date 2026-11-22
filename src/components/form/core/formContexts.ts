"use client";

import { createFormHookContexts } from "@tanstack/react-form";

/**
 * TanStack Form v1 官方组合上下文（与 `src/components/form/formHook.tsx` 配合使用）：
 * - 独立放置于 `core/` 内部以彻底规避 fieldComponents 与 FormFieldEngine 间的循环依赖。
 */
export const {
  fieldContext,
  formContext,
  useFieldContext,
  useFormContext: useAppFormContext,
} = createFormHookContexts();
