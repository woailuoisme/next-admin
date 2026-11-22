import { downloadBlob } from "@/components/data-table/hooks/useDataTableExport";
import { exportToExcel } from "@/lib/excel";

import type { ExportColumnOption, ExportFormat } from "../types";

export interface ParsedImportTable {
  headers: string[];
  rows: Record<string, unknown>[];
}

/**
 * 解析 RFC 4180 风格 CSV 文本（支持引号转义、BOM 与 CRLF/LF）
 */
export function parseCsvText(rawText: string): ParsedImportTable {
  const text = rawText.replace(/^\uFEFF/, "");
  const matrix: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field.trim());
      field = "";
    } else if (ch === "\r" && next === "\n") {
      row.push(field.trim());
      if (row.some((cell) => cell !== "")) matrix.push(row);
      row = [];
      field = "";
      i++;
    } else if (ch === "\n" || ch === "\r") {
      row.push(field.trim());
      if (row.some((cell) => cell !== "")) matrix.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }

  row.push(field.trim());
  if (row.some((cell) => cell !== "")) {
    matrix.push(row);
  }

  if (matrix.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = matrix[0].map((h, idx) => h || `column_${idx + 1}`);
  const rows = matrix.slice(1).map((cells) => {
    const record: Record<string, unknown> = {};
    for (let i = 0; i < headers.length; i++) {
      record[headers[i]] = cells[i] ?? "";
    }
    return record;
  });

  return { headers, rows };
}

/**
 * 解析上传的 CSV / JSON / XLSX 文件为统一行数组
 */
export async function parseImportFile(file: File): Promise<ParsedImportTable> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".json")) {
    const text = await file.text();
    const parsed = JSON.parse(text) as unknown;
    const list = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as { items?: unknown[] }).items)
        ? (parsed as { items: unknown[] }).items
        : [];
    const objectRows = list.filter((item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object"),
    );
    const headerSet = new Set<string>();
    for (const item of objectRows) {
      for (const key of Object.keys(item)) {
        headerSet.add(key);
      }
    }
    return { headers: [...headerSet], rows: objectRows };
  }

  if (lowerName.endsWith(".xlsx")) {
    const ExcelJS = await import("exceljs");
    const Workbook = ExcelJS.Workbook ?? ExcelJS.default?.Workbook;
    if (!Workbook) {
      throw new Error("ExcelJS Workbook unavailable");
    }
    const workbook = new Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) return { headers: [], rows: [] };

    const headers: string[] = [];
    const rows: Record<string, unknown>[] = [];
    worksheet.eachRow((excelRow, rowNumber) => {
      const values = Array.isArray(excelRow.values) ? excelRow.values.slice(1) : [];
      if (rowNumber === 1) {
        values.forEach((cell, idx) => {
          headers.push(
            cell !== undefined && cell !== null && String(cell).trim() ? String(cell).trim() : `column_${idx + 1}`,
          );
        });
        return;
      }
      if (headers.length === 0) return;
      const record: Record<string, unknown> = {};
      let hasValue = false;
      headers.forEach((header, idx) => {
        const rawVal = values[idx];
        const normalized =
          rawVal && typeof rawVal === "object" && "text" in rawVal ? (rawVal as { text: unknown }).text : rawVal;
        if (normalized !== undefined && normalized !== null && String(normalized).trim() !== "") {
          hasValue = true;
        }
        record[header] = normalized ?? "";
      });
      if (hasValue) rows.push(record);
    });
    return { headers, rows };
  }

  const text = await file.text();
  return parseCsvText(text);
}

/**
 * 清理文件扩展名
 */
function stripExportExt(fileName: string): string {
  return fileName.replace(/\.(csv|json|xlsx)$/i, "");
}

function getCellValue<TItem>(col: ExportColumnOption<TItem>, row: TItem): unknown {
  const raw = (row as Record<string, unknown>)[col.field];
  return col.valueFormatter ? col.valueFormatter(raw, row) : raw;
}

/**
 * 按指定格式与列集合导出数据
 */
export async function executeExportRows<TItem>(options: {
  rows: TItem[];
  columns: ExportColumnOption<TItem>[];
  format: ExportFormat;
  fileName: string;
}): Promise<void> {
  const { rows, columns, format, fileName } = options;
  const baseName = stripExportExt(fileName || "export");

  if (format === "xlsx") {
    await exportToExcel({
      fileName: baseName,
      columns: columns.map((c) => ({
        field: c.field,
        headerName: c.headerName,
        valueFormatter: c.valueFormatter,
      })),
      data: rows,
    });
    return;
  }

  if (format === "json") {
    const payload = rows.map((row) => {
      const out: Record<string, unknown> = {};
      for (const col of columns) {
        out[col.field] = getCellValue(col, row);
      }
      return out;
    });
    downloadBlob(JSON.stringify(payload, null, 2), `${baseName}.json`, "application/json");
    return;
  }

  const headers = columns.map((c) => `"${String(c.headerName).replace(/"/g, '""')}"`).join(",");
  const lines = rows.map((row) =>
    columns
      .map((col) => {
        const str = String(getCellValue(col, row) ?? "").replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(","),
  );
  downloadBlob(`\uFEFF${headers}\n${lines.join("\n")}`, `${baseName}.csv`, "text/csv;charset=utf-8;");
}
