import type { FocusEvent } from "react";

/** 容器失焦时判断焦点是否已离开当前子树（子元素间切换返回 false） */
export function isFocusLeaving(event: FocusEvent<HTMLElement>): boolean {
  return !event.currentTarget.contains(event.relatedTarget as Node | null);
}
