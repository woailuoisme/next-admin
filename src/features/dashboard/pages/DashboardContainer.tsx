"use client";

import { useMemoizedFn } from "ahooks";
import { parseAsStringLiteral, useQueryState } from "nuqs";

import { DashboardPage } from "./DashboardPage";
import { DASHBOARD_TIME_RANGES } from "../schemas";
import type { DashboardTimeRange } from "../types";

export function DashboardContainer() {
  const [range, setRange] = useQueryState(
    "range",
    parseAsStringLiteral(DASHBOARD_TIME_RANGES).withDefault("30d"),
  );

  const handleRangeChange = useMemoizedFn((newRange: DashboardTimeRange) => {
    setRange(newRange);
  });

  return <DashboardPage range={range} onRangeChange={handleRangeChange} />;
}
