import type { DataTableColDef, DataTableRenderCellParams } from "../core/types";
import type { OmitRender } from "./types";

import { DateCell } from "../cells/display/DateCell";

/**
 * 日期时间列构造器 (DateColumn)
 */
export function dateCol<TData = any>(
	field: keyof TData & string,
	headerName: string,
	options?: OmitRender<TData> & {
		headerDescription?: string;
		format?: string;
		relative?: boolean;
		showTooltip?: boolean;
		dualLine?: boolean;
		primaryFormat?: "relative" | "absolute";
		showIcon?: boolean;
		overdueAlert?: boolean;
		countdown?: boolean;
		countdownPrefix?: string;
		timezone?: string;
	},
): DataTableColDef<TData> {
	const {
		headerDescription,
		format,
		relative,
		showTooltip,
		dualLine,
		primaryFormat,
		showIcon,
		overdueAlert,
		countdown,
		countdownPrefix,
		timezone,
		...colDef
	} = options || {};

	return {
		field,
		headerName,
		description: headerDescription,
		sortable: true,
		filterable: true,
		align: "left",
		renderCell: ({ value }: DataTableRenderCellParams<TData>) => (
			<DateCell
				value={value}
				format={format}
				relative={relative}
				showTooltip={showTooltip}
				dualLine={dualLine}
				primaryFormat={primaryFormat}
				showIcon={showIcon}
				overdueAlert={overdueAlert}
				countdown={countdown}
				countdownPrefix={countdownPrefix}
				timezone={timezone}
				align={colDef.align}
			/>
		),
		...colDef,
	};
}
