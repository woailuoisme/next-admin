import type React from "react";

import type { AvatarCellProps, ImageCellProps } from "../cells/media/types";
import type { DataTableColDef, DataTableRenderCellParams } from "../core/types";
import type { OmitRender } from "./types";

import { AvatarCell, ImageCell } from "../cells/media";
import { resolveFn } from "./utils";

/**
 * 1. 头像列构造器 (AvatarColumn)
 */
export function avatarCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    name?: (row: TData) => React.ReactNode;
    subtext?: (row: TData) => React.ReactNode;
    fallback?: (row: TData) => string;
    shape?: AvatarCellProps["shape"];
    size?: AvatarCellProps["size"];
    statusField?: keyof TData & string;
    getStatus?: (row: TData) => AvatarCellProps["status"];
    autoColor?: boolean;
    stacked?: (row: TData) => AvatarCellProps["stacked"];
    maxStacked?: number;
  },
): DataTableColDef<TData> {
  const {
    headerDescription,
    name,
    subtext,
    fallback,
    shape,
    size,
    statusField,
    getStatus,
    autoColor = true,
    stacked,
    maxStacked,
    ...colDef
  } = options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: false,
    filterable: false,
    align: "left",
    renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => {
      const status = getStatus
        ? getStatus(row)
        : statusField
          ? (row[statusField] as AvatarCellProps["status"])
          : undefined;

      return (
        <AvatarCell
          src={value}
          name={resolveFn(name, row)}
          subtext={resolveFn(subtext, row)}
          fallback={resolveFn(fallback, row)}
          shape={shape}
          size={size}
          status={status}
          autoColor={autoColor}
          stacked={resolveFn(stacked, row)}
          maxStacked={maxStacked}
          align={colDef.align}
        />
      );
    },
    ...colDef,
  };
}

/**
 * 2. 独立图片/缩略图列构造器 (ImageColumn)
 */
export function imageCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    alt?: (row: TData) => string;
    imageWidth?: ImageCellProps["width"];
    imageHeight?: ImageCellProps["height"];
    size?: ImageCellProps["size"];
    shape?: ImageCellProps["shape"];
    aspectRatio?: ImageCellProps["aspectRatio"];
    objectFit?: ImageCellProps["objectFit"];
    preview?: boolean;
    maxStacked?: number;
    placeholderType?: ImageCellProps["placeholderType"];
    gallery?: boolean;
    fallback?: React.ReactNode;
    tooltip?: (row: TData) => React.ReactNode;
  },
): DataTableColDef<TData> {
  const {
    headerDescription,
    alt,
    imageWidth,
    imageHeight,
    size = "md",
    shape,
    aspectRatio,
    objectFit,
    preview,
    maxStacked,
    placeholderType,
    gallery,
    fallback,
    tooltip,
    ...colDef
  } = options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: false,
    filterable: false,
    align: "left",
    ...colDef,
    renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
      <ImageCell
        src={value}
        alt={resolveFn(alt, row)}
        width={imageWidth}
        height={imageHeight}
        size={size}
        shape={shape}
        aspectRatio={aspectRatio}
        objectFit={objectFit}
        preview={preview}
        maxStacked={maxStacked}
        placeholderType={placeholderType}
        gallery={gallery}
        fallback={fallback}
        tooltip={resolveFn(tooltip, row)}
        align={colDef.align}
      />
    ),
  };
}
