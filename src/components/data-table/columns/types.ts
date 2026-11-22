import type { ActionEntry } from "@/components/actions";

import type { DataTableColDef } from "../core/types";

export type OmitRender<T> = Omit<DataTableColDef<T>, "field" | "headerName" | "renderCell" | "description">;

export type ActionsColOptions<T = unknown> = Omit<DataTableColDef<T>, "field" | "headerName" | "renderCell"> & {
  field?: string;
  headerName?: string;
  actions: readonly ActionEntry<T>[];
  maxInline?: number;
  moreActionsLabel?: string;
};
