import type { NumberCellProps } from "../cells/display/types";
import type { DataTableColDef, DataTableRenderCellParams } from "../core/types";
import type { OmitRender } from "./types";

import { NumberCell } from "../cells/display/NumberCell";
import { resolveProp } from "./utils";

/**
 * 数值列构造器 (NumberColumn)
 */
export function numberCol<TData = any>(
	field: keyof TData & string,
	headerName: string,
	options?: OmitRender<TData> & {
		headerDescription?: string;
		decimals?: number;
		precision?: number;
		prefix?: string;
		suffix?: string;
		compact?: boolean;
		colorize?: boolean;
		trend?: boolean;
		delta?: number | ((row: TData) => number | undefined);
		deltaType?: NumberCellProps["deltaType"];
		deltaDescription?: string | ((row: TData) => string | undefined);
		deltaPrefix?: string;
	},
): DataTableColDef<TData> {
	const {
		headerDescription,
		decimals,
		precision,
		prefix,
		suffix,
		compact,
		colorize,
		trend,
		delta,
		deltaType,
		deltaDescription,
		deltaPrefix,
		...colDef
	} = options || {};

	return {
		field,
		headerName,
		description: headerDescription,
		sortable: true,
		filterable: true,
		align: "right",
		headerAlign: "right",
		renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
			<NumberCell
				value={value}
				precision={precision}
				decimals={decimals}
				prefix={prefix}
				suffix={suffix}
				compact={compact}
				colorize={colorize}
				trend={trend}
				delta={resolveProp(delta, row)}
				deltaType={deltaType}
				deltaDescription={resolveProp(deltaDescription, row)}
				deltaPrefix={deltaPrefix}
			/>
		),
		...colDef,
	};
}

/**
 * 货币列构造器 (CurrencyColumn)
 */
export function currencyCol<TData = any>(
	field: keyof TData & string,
	headerName: string,
	options?: OmitRender<TData> & {
		headerDescription?: string;
		currency?: string;
		currencyCode?: string;
		decimals?: number;
		precision?: number;
		compact?: boolean;
		colorize?: boolean;
		trend?: boolean;
		delta?: number | ((row: TData) => number | undefined);
		deltaType?: NumberCellProps["deltaType"];
		deltaDescription?: string | ((row: TData) => string | undefined);
	},
): DataTableColDef<TData> {
	const {
		headerDescription,
		currency,
		currencyCode,
		decimals,
		precision,
		compact,
		colorize,
		trend,
		delta,
		deltaType,
		deltaDescription,
		...colDef
	} = options || {};

	return {
		field,
		headerName,
		description: headerDescription,
		sortable: true,
		filterable: true,
		align: "right",
		headerAlign: "right",
		renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
			<NumberCell
				value={value}
				mode="currency"
				currency={currency}
				currencyCode={currencyCode}
				precision={precision}
				decimals={decimals}
				compact={compact}
				colorize={colorize}
				trend={trend}
				delta={resolveProp(delta, row)}
				deltaType={deltaType}
				deltaDescription={resolveProp(deltaDescription, row)}
			/>
		),
		...colDef,
	};
}
