import type React from "react";

import type { TextCellProps } from "../cells/display/types";
import type { DataTableColDef, DataTableRenderCellParams } from "../core/types";
import type { OmitRender } from "./types";

import { TextCell } from "../cells/display/TextCell";
import { resolveFn, resolveProp } from "./utils";

/**
 * 文本列构造器 (TextColumn)
 */
export function textCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    description?: (row: TData) => React.ReactNode;
    copyable?: boolean | ((row: TData) => string);
    mono?: boolean;
    truncate?: boolean;
    size?: TextCellProps["size"];
    weight?: TextCellProps["weight"];
    tooltip?: (row: TData) => React.ReactNode;
    url?: string | ((row: TData) => string);
    isExternal?: boolean;
    lineClamp?: TextCellProps["lineClamp"];
    highlightText?: string | ((row: TData) => string);
    tag?: React.ReactNode | ((row: TData) => React.ReactNode);
    tagVariant?: TextCellProps["tagVariant"];
    kbd?: string | ((row: TData) => string);
  },
): DataTableColDef<TData> {
  const {
    headerDescription,
    description,
    copyable,
    mono,
    truncate,
    size,
    weight,
    tooltip,
    url,
    isExternal,
    lineClamp,
    highlightText,
    tag,
    tagVariant,
    kbd,
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
      <TextCell
        value={value}
        description={resolveFn(description, row)}
        copyable={resolveProp(copyable, row)}
        mono={mono}
        truncate={truncate}
        size={size}
        weight={weight}
        tooltip={resolveFn(tooltip, row)}
        url={resolveProp(url, row)}
        isExternal={isExternal}
        lineClamp={lineClamp}
        highlightText={resolveProp(highlightText, row)}
        tag={resolveProp(tag, row)}
        tagVariant={tagVariant}
        kbd={resolveProp(kbd, row)}
      />
    ),
    ...colDef,
  };
}
