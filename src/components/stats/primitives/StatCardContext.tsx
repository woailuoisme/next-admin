import { createContext, useContext } from "react";

import type { SparklineLayout, StatCardTheme, StatDensity } from "../shared/types";

export interface StatCardContextValue {
  density: StatDensity;
  sparklineLayout: SparklineLayout;
  theme: StatCardTheme;
  isInteractive: boolean;
}

export const StatCardContext = createContext<StatCardContextValue>({
  density: "compact",
  sparklineLayout: "inline",
  theme: "primary",
  isInteractive: false,
});

export function useStatCardContext(): StatCardContextValue {
  return useContext(StatCardContext);
}
