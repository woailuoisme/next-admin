import type { DataTableColDef } from "./types";

/**
 * 统一单元格取值：优先使用列的 valueGetter，回退到行的同名字段
 * 收敛原先散落在表体 / 表尾 / 导出 / 排序中的 `valueGetter ? ... : (row as any)[field]`
 */
export function readCellValue<TData>(row: TData, col: Pick<DataTableColDef<TData>, "field" | "valueGetter">): unknown {
  if (col.valueGetter) {
    return col.valueGetter(row);
  }
  return (row as Record<string, unknown>)[col.field];
}
