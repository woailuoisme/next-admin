"use client";

import { useSessionValidation } from "../hooks";

/** 无渲染组件：挂载时校验本地会话是否仍有效 */
export function SessionValidator() {
  useSessionValidation();
  return null;
}
