import { useMemoizedFn } from "ahooks";
import { useFormatter } from "next-intl";

import { defaultAxisNumberFormatter, defaultXAxisFormatter } from "../shared/formatters";

export interface UseChartFormattersOptions {
  valueFormatter?: (val: number) => string;
  xAxisFormatter?: (val: string | number) => string;
  yAxisFormatter?: (val: number) => string;
}

/**
 * Hook providing stable memoized formatters for chart axes and tooltips
 * Eliminates duplicate formatting definitions across chart trend hooks
 */
export function useChartFormatters({
  valueFormatter: propValueFormatter,
  xAxisFormatter: propXAxisFormatter,
  yAxisFormatter: propYAxisFormatter,
}: UseChartFormattersOptions = {}) {
  const format = useFormatter();

  const valueFormatter = useMemoizedFn((val: number) => {
    if (propValueFormatter) return propValueFormatter(val);
    return format.number(val);
  });

  const xAxisFormatter = useMemoizedFn((val: string | number) => {
    if (propXAxisFormatter) return propXAxisFormatter(val);
    return defaultXAxisFormatter(val);
  });

  const yAxisFormatter = useMemoizedFn((val: number) => {
    if (propYAxisFormatter) return propYAxisFormatter(val);
    return defaultAxisNumberFormatter(val);
  });

  return {
    valueFormatter,
    xAxisFormatter,
    yAxisFormatter,
  };
}
