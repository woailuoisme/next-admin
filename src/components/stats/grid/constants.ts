import type { StatsGridColumns } from "./types";

export const COLUMN_MAP: Record<StatsGridColumns, string> = {
  2: "grid-cols-1 @sm/grid:grid-cols-2",
  3: "grid-cols-1 @sm/grid:grid-cols-2 @2xl/grid:grid-cols-3",
  4: "grid-cols-1 @sm/grid:grid-cols-2 @4xl/grid:grid-cols-4",
  5: "grid-cols-1 @sm/grid:grid-cols-2 @2xl/grid:grid-cols-3 @5xl/grid:grid-cols-5",
};
