import { memo } from "react";

import type { CurrencyCellProps } from "./types";

import { NumberCell } from "./NumberCell";

export const CurrencyCell = memo(function CurrencyCell({
  currency = "$",
  precision = 2,
  ...props
}: CurrencyCellProps) {
  return <NumberCell mode="currency" currency={currency} precision={precision} {...props} />;
});
