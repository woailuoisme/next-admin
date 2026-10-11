import { toast } from "sonner";

export interface ExcelColumnDefinition<TData = any> {
  field: string;
  headerName: string;
  width?: number;
  valueFormatter?: (value: any, row: TData) => unknown;
}

export interface ExportToExcelOptions<TData = any> {
  fileName?: string;
  sheetName?: string;
  columns: ExcelColumnDefinition<TData>[];
  data: TData[];
  /** 自定义表头主题色，默认高质感企业级浅灰 */
  headerBgColor?: string;
}

/**
 * 动态异步加载 exceljs 并导出带有样式、自适应列宽、冻结表头的专业 .xlsx 文件
 * 采用 Code Splitting 策略，首屏零打包开销
 */
export async function exportToExcel<TData = any>({
  fileName = "export-data",
  sheetName = "Sheet1",
  columns,
  data,
  headerBgColor = "FFF4F4F5",
}: ExportToExcelOptions<TData>): Promise<void> {
  if (!data || data.length === 0) {
    toast.error("No data available to export");
    return;
  }

  const toastId = toast.loading("Preparing Excel file...");

  try {
    // 动态按需导入 exceljs
    const ExcelJS = await import("exceljs");
    const Workbook = ExcelJS.Workbook ?? ExcelJS.default?.Workbook;

    if (!Workbook) {
      throw new Error("Failed to load ExcelJS Workbook engine");
    }

    const workbook = new Workbook();
    workbook.creator = "next-admin";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ state: "frozen", ySplit: 1 }], // 默认冻结表头首行
    });

    // 过滤出有效可见列（排除操作列与纯勾选列）
    const validCols = columns.filter(
      (c) => c.field !== "__actions" && c.field !== "__select" && c.field !== "actions",
    );

    // 1. 设置工作表列结构
    worksheet.columns = validCols.map((col) => {
      // 预估自适应列宽：取表头和前 30 行样本的最大字符长度
      let maxLen = col.headerName ? col.headerName.length * 1.5 : 10;
      const sampleRows = data.slice(0, 30);
      for (const row of sampleRows) {
        const val = col.valueFormatter
          ? col.valueFormatter((row as any)[col.field], row)
          : (row as any)[col.field];
        if (val !== undefined && val !== null) {
          const strLen = String(val).length;
          if (strLen > maxLen) {
            maxLen = strLen;
          }
        }
      }
      return {
        header: col.headerName,
        key: col.field,
        width: Math.max(12, Math.min(Math.ceil(maxLen) + 4, 45)),
      };
    });

    // 2. 表头行样式定制（高质感企业风：加粗、背景填充、细边框、居中）
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: headerBgColor },
      };
      cell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FF18181B" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "left",
        indent: 1,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE4E4E7" } },
        left: { style: "thin", color: { argb: "FFE4E4E7" } },
        bottom: { style: "medium", color: { argb: "FFD4D4D8" } },
        right: { style: "thin", color: { argb: "FFE4E4E7" } },
      };
    });

    // 3. 填充数据行
    for (const item of data) {
      const rowData: Record<string, unknown> = {};
      for (const col of validCols) {
        const raw = (item as any)[col.field];
        const formatted = col.valueFormatter ? col.valueFormatter(raw, item) : raw;
        rowData[col.field] = formatted ?? "";
      }
      const newRow = worksheet.addRow(rowData);
      newRow.height = 22;
      newRow.eachCell((cell) => {
        cell.font = { name: "Arial", size: 10 };
        cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
        cell.border = {
          top: { style: "thin", color: { argb: "FFF4F4F5" } },
          left: { style: "thin", color: { argb: "FFF4F4F5" } },
          bottom: { style: "thin", color: { argb: "FFE4E4E7" } },
          right: { style: "thin", color: { argb: "FFF4F4F5" } },
        };
      });
    }

    // 4. 生成 Excel Buffer 并通过 Blob 下载
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const cleanFileName = fileName.replace(/\.(xlsx|csv|json)$/i, "");
    const finalName = `${cleanFileName}-${new Date().toISOString().slice(0, 10)}.xlsx`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", finalName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    toast.success("Excel file downloaded successfully", { id: toastId });
  } catch (error) {
    console.error("[Excel Export Error]:", error);
    toast.error("Failed to generate Excel file", { id: toastId });
  }
}
