import type {
  DataTableColDef,
  DataTableFilterConfig,
  DataTableFilterDefinition,
  DataTableFilterModel,
} from "../../core/types";

export interface DataTableFilterPanelProps<TData = any> {
  columns: DataTableColDef<TData>[];
  filterModel: DataTableFilterModel;
  onFilterModelChange: (model: DataTableFilterModel) => void;
  filterConfig?: DataTableFilterConfig;
  filters?: DataTableFilterDefinition[];
  data?: TData[];
}

export interface BaseFilterControlProps<
  TDef extends DataTableFilterDefinition = DataTableFilterDefinition,
> {
  definition: TDef;
  field: string;
  label: string;
  value: any;
  onChange: (value: any) => void;
}
