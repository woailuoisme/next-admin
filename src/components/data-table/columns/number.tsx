import type { NumberCellProps } from "../cells/display/types";
import type { DataTableColDef, DataTableRenderCellParams } from "../core/types";
import type { OmitRender } from "./types";

import { NumberCell } from "../cells/display/NumberCell";
import { resolveProp } from "./utils";

type NumericColumnOptions<TData> = OmitRender<TData> & {
	headerDescription?: string;
	mode?: "number" | "currency";
	currency?: string;
	currencyCode?: string;
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
};

function buildNumericCol<TData = any>(
	field: keyof TData & string,
	headerName: string,
	options?: NumericColumnOptions<TData>,
): DataTableColDef<TData> {
	const {
		headerDescription,
		mode = "number",
		currency,
		currencyCode,
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
				mode={mode}
				currency={currency}
				currencyCode={currencyCode}
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
				align={colDef.align ?? "right"}
			/>
		),
		...colDef,
	};
}

/**
 * 数值列构造器 (NumberColumn)
 */
export function numberCol<TData = any>(
	field: keyof TData & string,
	headerName: string,
	options?: Omit<NumericColumnOptions<TData>, "mode" | "currency" | "currencyCode">,
): DataTableColDef<TData> {
	return buildNumericCol(field, headerName, options);
}

/**
 * 货币列构造器 (CurrencyColumn)
 */
export function currencyCol<TData = any>(
	field: keyof TData & string,
	headerName: string,
	options?: Omit<NumericColumnOptions<TData>, "mode" | "prefix" | "suffix" | "deltaPrefix">,
): DataTableColDef<TData> {
	return buildNumericCol(field, headerName, { ...options, mode: "currency" });
}
