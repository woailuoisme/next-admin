import { Checkbox } from "@/components/ui/checkbox";

import type {
  CheckboxCellProps,
  SelectCellOption,
  SelectCellProps,
  TextInputCellProps,
  ToggleCellProps,
} from "../cells/interactive/types";
import type { DataTableColDef, DataTableRenderCellParams } from "../core/types";
import type { OmitRender } from "./types";

import { CheckboxCell, SelectCell, TextInputCell, ToggleCell } from "../cells/interactive";
import { resolveProp } from "./utils";

/**
 * 1. 行内即时开关列构造器 (ToggleColumn)
 */
export function toggleCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    onCellChange?: ToggleCellProps<TData>["onCellChange"];
    onToggle?: ToggleCellProps<TData>["onToggle"];
    showErrorToast?: boolean;
    errorToastMessage?: ToggleCellProps<TData>["errorToastMessage"];
    disabled?: boolean | ((row: TData) => boolean);
    readOnly?: boolean;
  },
): DataTableColDef<TData> {
  const {
    headerDescription,
    onCellChange,
    onToggle,
    showErrorToast,
    errorToastMessage,
    disabled,
    readOnly,
    ...colDef
  } = options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: true,
    filterable: true,
    align: "center",
    renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
      <ToggleCell
        checked={Boolean(value)}
        row={row}
        onCellChange={onCellChange}
        onToggle={onToggle}
        showErrorToast={showErrorToast}
        errorToastMessage={errorToastMessage}
        disabled={resolveProp(disabled, row)}
        readOnly={readOnly}
        align={colDef.align || "center"}
      />
    ),
    ...colDef,
  };
}

/**
 * 2. 行内即时选择下拉列构造器 (SelectColumn)
 */
export function selectCol<TData = any, TVal extends string = string>(
  field: keyof TData & string,
  headerName: string,
  options: OmitRender<TData> & {
    headerDescription?: string;
    options: SelectCellOption<TVal>[];
    onCellChange?: SelectCellProps<TData, TVal>["onCellChange"];
    showErrorToast?: boolean;
    errorToastMessage?: SelectCellProps<TData, TVal>["errorToastMessage"];
    disabled?: boolean | ((row: TData) => boolean);
  },
): DataTableColDef<TData> {
  const {
    headerDescription,
    options: selectOptions,
    onCellChange,
    showErrorToast,
    errorToastMessage,
    disabled,
    ...colDef
  } = options;

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: true,
    filterable: true,
    align: "left",
    renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
      <SelectCell
        value={value as TVal}
        options={selectOptions}
        row={row}
        onCellChange={onCellChange}
        showErrorToast={showErrorToast}
        errorToastMessage={errorToastMessage}
        disabled={resolveProp(disabled, row)}
        align={colDef.align}
      />
    ),
    ...colDef,
  };
}

/**
 * 3. 行内即时文本编辑列构造器 (TextInputColumn)
 */
export function textInputCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    onCellChange?: TextInputCellProps<TData>["onCellChange"];
    type?: TextInputCellProps<TData>["type"];
    inputMode?: TextInputCellProps<TData>["inputMode"];
    placeholder?: string;
    prefix?: TextInputCellProps<TData>["prefix"];
    suffix?: TextInputCellProps<TData>["suffix"];
    schema?: TextInputCellProps<TData>["schema"];
    rules?: TextInputCellProps<TData>["rules"];
    showErrorToast?: boolean;
    errorToastMessage?: TextInputCellProps<TData>["errorToastMessage"];
    disabled?: boolean | ((row: TData) => boolean);
  },
): DataTableColDef<TData> {
  const {
    headerDescription,
    onCellChange,
    type,
    inputMode,
    placeholder,
    prefix,
    suffix,
    schema,
    rules,
    showErrorToast,
    errorToastMessage,
    disabled,
    ...colDef
  } = options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: true,
    filterable: true,
    align: "left",
    renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
      <TextInputCell
        value={value}
        row={row}
        onCellChange={onCellChange}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        prefix={prefix}
        suffix={suffix}
        schema={schema}
        rules={rules}
        showErrorToast={showErrorToast}
        errorToastMessage={errorToastMessage}
        disabled={resolveProp(disabled, row)}
        align={colDef.align}
      />
    ),
    ...colDef,
  };
}

/**
 * 4. 行内即时复选框列构造器 (CheckboxColumn)
 */
export function checkboxCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    onCellChange?: CheckboxCellProps<TData>["onCellChange"];
    showErrorToast?: boolean;
    errorToastMessage?: CheckboxCellProps<TData>["errorToastMessage"];
    disabled?: boolean | ((row: TData) => boolean);
    headerCheckbox?: boolean | React.ReactNode;
    onHeaderCheckboxChange?: (checked: boolean) => void;
    isAllChecked?: boolean;
    isIndeterminate?: boolean;
  },
): DataTableColDef<TData> {
  const {
    headerDescription,
    onCellChange,
    showErrorToast,
    errorToastMessage,
    disabled,
    headerCheckbox,
    onHeaderCheckboxChange,
    isAllChecked,
    isIndeterminate,
    ...colDef
  } = options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: false,
    filterable: false,
    align: "center",
    ...colDef,
    renderHeader:
      colDef.renderHeader ||
      (headerCheckbox
        ? () =>
            typeof headerCheckbox === "boolean" ? (
              <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isAllChecked ? true : isIndeterminate ? "indeterminate" : false}
                  onCheckedChange={(checked) => onHeaderCheckboxChange?.(Boolean(checked))}
                  aria-label={headerName || "全选"}
                />
              </div>
            ) : (
              headerCheckbox
            )
        : undefined),
    renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
      <CheckboxCell
        checked={Boolean(value)}
        row={row}
        onCellChange={onCellChange}
        showErrorToast={showErrorToast}
        errorToastMessage={errorToastMessage}
        disabled={resolveProp(disabled, row)}
        align={colDef.align || "center"}
      />
    ),
  };
}
