import { createContext, useContext } from "react";

import type { SparklineLayout, StatDensity } from "../shared/types";

export interface StatsGridContextValue {
  density?: StatDensity;
  sparklineLayout?: SparklineLayout;
}

export const StatsGridContext = createContext<StatsGridContextValue>({
  density: "compact",
  sparklineLayout: "inline",
});

export function useStatsGridContext(): StatsGridContextValue {
  return useContext(StatsGridContext);
}
