import type { BadgeCellProps } from "../cells/display/types";
import type { DataTableColDef, DataTableRenderCellParams } from "../core/types";
import type { OmitRender } from "./types";

import { BadgeCell } from "../cells/display/BadgeCell";
import { resolveProp } from "./utils";

/**
 * 徽章状态列构造器 (BadgeColumn)
 */
export function badgeCol<TData = any>(
	field: keyof TData & string,
	headerName: string,
	options?: OmitRender<TData> & {
		headerDescription?: string;
		variant?: BadgeCellProps["variant"];
		color?: BadgeCellProps["color"];
		maxCount?: number;
		variantMap?: BadgeCellProps["variantMap"];
		labelMap?: BadgeCellProps["labelMap"];
		dot?: boolean | ((row: TData) => boolean);
		pulse?: boolean | ((row: TData) => boolean);
		density?: BadgeCellProps["density"];
		onBadgeClick?: (row: TData, value: any) => void;
	},
): DataTableColDef<TData> {
	const {
		headerDescription,
		variant,
		color,
		maxCount,
		variantMap,
		labelMap,
		dot,
		pulse,
		density,
		onBadgeClick,
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
			<BadgeCell
				value={value}
				variant={variant || color}
				maxCount={maxCount}
				variantMap={variantMap}
				labelMap={labelMap}
				dot={resolveProp(dot, row)}
				pulse={resolveProp(pulse, row)}
				density={density}
				onBadgeClick={onBadgeClick ? (val) => onBadgeClick(row, val) : undefined}
			/>
		),
		...colDef,
	};
}
