import type { KeyboardEvent } from "react";

/** 单元格内可嵌套的交互子元素：其按键不应触发外层容器激活 */
export const CELL_ACTIVATION_IGNORE_SELECTOR = "a, button";

/** 表格行内需放行的原生控件及 ARIA 交互角色 */
export const ROW_ACTIVATION_IGNORE_SELECTOR = 'button, a, input, select, textarea, [role="button"], [role="checkbox"]';

/**
 * 为非原生按钮容器（`role="button"`）提供统一的 Enter / Space 键盘激活：
 * 事件来自内部交互子元素时放行，否则阻止默认行为并执行 `onActivate`。
 *
 * @returns 是否已触发激活
 */
export function handleActivationKey(
  e: KeyboardEvent<HTMLElement>,
  onActivate: () => void,
  ignoreSelector: string = CELL_ACTIVATION_IGNORE_SELECTOR,
): boolean {
  if (e.target !== e.currentTarget && (e.target as HTMLElement).closest(ignoreSelector)) {
    return false;
  }
  if (e.key !== "Enter" && e.key !== " ") {
    return false;
  }
  e.preventDefault();
  onActivate();
  return true;
}
