import type { DataTableRowId } from "./types";

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE_SIZE_OPTIONS: readonly number[] = [20, 50, 100];

/** 稳定的空数组引用，用作 memo 组件 props 的兜底默认值 */
export const EMPTY_ARRAY: never[] = [];

/** 稳定的空对象引用，用作 memo 组件 props 的兜底默认值 */
export const EMPTY_RECORD: Record<string, never> = {};

/** 稳定的空函数引用，避免每次渲染新建闭包导致子组件 memo 失效 */
export const NOOP = (): void => {};

/** 默认行主键解析：依次回退 id / _id / key */
export function defaultGetRowId<TData extends Record<string, any>>(row: TData): DataTableRowId {
  const record = row as Record<string, unknown>;
  return (record.id ?? record._id ?? record.key ?? "") as DataTableRowId;
}
