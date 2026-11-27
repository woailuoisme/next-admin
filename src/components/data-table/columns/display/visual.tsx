import type React from "react";

import type { ColorCellProps, IconCellProps, MaskedCellProps } from "../../cells/display/types";
import type { DataTableColDef, DataTableRenderCellParams } from "../../core/types";
import type { OmitRender } from "../types";

import { ColorCell } from "../../cells/display/ColorCell";
import { IconCell } from "../../cells/display/IconCell";
import { MaskedCell } from "../../cells/display/MaskedCell";
import { resolveFn, resolveProp } from "../utils";

/** 敏感数据脱敏列构造器 (MaskedColumn) */
export function maskedCol<TData = any>(
	field: keyof TData & string,
	headerName: string,
	options?: OmitRender<TData> & {
		headerDescription?: string;
		type?: MaskedCellProps["maskType"];
		maskType?: MaskedCellProps["maskType"];
		customMask?: MaskedCellProps["customMask"];
		allowReveal?: boolean;
		copyable?: boolean;
		allowCopy?: boolean;
		maskChar?: string;
		autoHideDuration?: number;
		mono?: boolean;
	},
): DataTableColDef<TData> {
	const {
		headerDescription,
		type,
		maskType = type,
		customMask,
		allowReveal,
		copyable,
		allowCopy,
		maskChar,
		autoHideDuration,
		mono,
		...colDef
	} = options || {};

	return {
		field,
		headerName,
		description: headerDescription,
		sortable: false,
		filterable: false,
		align: "left",
		renderCell: ({ value }: DataTableRenderCellParams<TData>) => (
			<MaskedCell
				value={value}
				maskType={maskType}
				customMask={customMask}
				allowReveal={allowReveal}
				copyable={copyable}
				allowCopy={allowCopy}
				maskChar={maskChar}
				autoHideDuration={autoHideDuration}
				mono={mono}
				align={colDef.align}
			/>
		),
		...colDef,
	};
}

/** 颜色指示列构造器 (ColorColumn) */
export function colorCol<TData = any>(
	field: keyof TData & string,
	headerName: string,
	options?: OmitRender<TData> & {
		headerDescription?: string;
		showHex?: boolean;
		copyable?: boolean;
		shape?: ColorCellProps["shape"];
		checkerboard?: boolean;
	},
): DataTableColDef<TData> {
	const { headerDescription, showHex, copyable, shape, checkerboard, ...colDef } = options || {};

	return {
		field,
		headerName,
		description: headerDescription,
		sortable: true,
		filterable: true,
		align: "left",
		renderCell: ({ value }: DataTableRenderCellParams<TData>) => (
			<ColorCell
				value={value}
				showHex={showHex}
				copyable={copyable}
				shape={shape}
				checkerboard={checkerboard}
				align={colDef.align}
			/>
		),
		...colDef,
	};
}

/** 图标状态列构造器 (IconColumn) */
export function iconCol<TData = any>(
	field: keyof TData & string,
	headerName: string,
	options?: OmitRender<TData> & {
		headerDescription?: string;
		iconMap?: IconCellProps["iconMap"];
		colorMap?: IconCellProps["colorMap"];
		size?: IconCellProps["size"];
		tooltip?: (row: TData) => React.ReactNode;
		container?: IconCellProps["container"];
		label?: React.ReactNode | ((row: TData) => React.ReactNode);
		labelPosition?: IconCellProps["labelPosition"];
	},
): DataTableColDef<TData> {
	const { headerDescription, iconMap, colorMap, size, tooltip, container, label, labelPosition, ...colDef } =
		options || {};

	return {
		field,
		headerName,
		description: headerDescription,
		sortable: true,
		filterable: true,
		align: "center",
		headerAlign: "center",
		renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
			<IconCell
				value={value}
				iconMap={iconMap}
				colorMap={colorMap}
				size={size}
				tooltip={resolveFn(tooltip, row)}
				container={container}
				label={resolveProp(label, row)}
				labelPosition={labelPosition}
				align={colDef.align ?? "center"}
			/>
		),
		...colDef,
	};
}
