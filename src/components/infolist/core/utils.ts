import type * as React from "react";

/**
 * 判断 ReactNode 是否包含可渲染内容（兼容数字 `0`，过滤 `null`/`undefined`/`false`/`""`）
 */
export function hasRenderableNode(node: React.ReactNode): boolean {
  return node !== null && node !== undefined && node !== false && node !== "";
}
