export type DemoState = "normal" | "loading" | "empty" | "error";

/** 各演示标签页统一的加载 / 空态 / 错误 入参 */
export interface DemoStateProps {
  isLoading: boolean;
  isEmpty: boolean;
  isError: boolean;
  onRetry: () => void;
}
