import { useLatest, useMemoizedFn } from "ahooks";

import type { DataTableColDef } from "../core/types";

import { exportToExcel } from "@/lib/excel";

import { readCellValue } from "../core/utils";

/** 触发浏览器下载并回收对象 URL */
export function downloadBlob(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 读取并按列的 valueFormatter 格式化导出值 */
function getExportCellValue<TData>(col: DataTableColDef<TData>, row: TData): unknown {
  const val = readCellValue(row, col);
  return col.valueFormatter ? col.valueFormatter(val, row) : val;
}

/** 去除导出文件名中已有的扩展名 */
function stripExtension(fileName: string): string {
  return fileName.replace(/\.(csv|json|xlsx)$/i, "");
}

export interface UseDataTableExportOptions<TData> {
  visibleColumns: DataTableColDef<TData>[];
  selectedFullRows: TData[];
  processedRows: TData[];
  exportFileName?: string;
}

export function useDataTableExport<TData = any>({
  visibleColumns,
  selectedFullRows,
  processedRows,
  exportFileName = "datatable-export",
}: UseDataTableExportOptions<TData>) {
  const latestRef = useLatest({
    visibleColumns,
    selectedFullRows,
    processedRows,
    exportFileName,
  });

  const handleExportExcel = useMemoizedFn(async () => {
    const {
      visibleColumns: cols,
      selectedFullRows: selected,
      processedRows: processed,
      exportFileName: fileName,
    } = latestRef.current;

    const targetRows = selected.length > 0 ? selected : processed;
    await exportToExcel({
      columns: cols,
      data: targetRows,
      fileName,
    });
  });

  const handleExportCsv = useMemoizedFn(() => {
    const {
      visibleColumns: cols,
      selectedFullRows: selected,
      processedRows: processed,
      exportFileName: fileName,
    } = latestRef.current;

    const targetRows = selected.length > 0 ? selected : processed;
    const headers = cols.map((c) => `"${c.headerName}"`).join(",");
    const body = targetRows
      .map((row) =>
        cols
          .map((col) => {
            const str = String(getExportCellValue(col, row) ?? "").replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(","),
      )
      .join("\n");

    downloadBlob(`\uFEFF${headers}\n${body}`, `${stripExtension(fileName)}.csv`, "text/csv;charset=utf-8;");
  });

  const handleExportJson = useMemoizedFn(() => {
    const {
      visibleColumns: cols,
      selectedFullRows: selected,
      processedRows: processed,
      exportFileName: fileName,
    } = latestRef.current;

    const targetRows = selected.length > 0 ? selected : processed;
    const data = targetRows.map((row) => {
      const obj: Record<string, unknown> = {};
      for (const col of cols) {
        obj[col.field] = getExportCellValue(col, row);
      }
      return obj;
    });

    downloadBlob(JSON.stringify(data, null, 2), `${stripExtension(fileName)}.json`, "application/json");
  });

  const handlePrint = useMemoizedFn(() => {
    if (typeof window !== "undefined") {
      window.print();
    }
  });

  return {
    handleExportExcel,
    handleExportCsv,
    handleExportJson,
    handlePrint,
  };
}
