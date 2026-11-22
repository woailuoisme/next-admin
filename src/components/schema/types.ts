import type { DateTimeFormatOptions } from "next-intl";
import type { ReactNode } from "react";

import type { CascaderOption } from "@/components/form/choice/Cascader";
import type { TreeSelectNode } from "@/components/form/choice/TreeSelect";
import type {
  RepeaterGlobalHelpers,
  RepeaterHeaderColumn,
  RepeaterItemHelpers,
  RepeaterLayout,
} from "@/components/form/composite/repeater/types";
import type { AppFormContract, SelectOption, ToggleButtonOption } from "@/components/form/core/types";
import type { CalloutAction, CalloutColor } from "@/components/infolist/callout/types";
import type { EntrySemanticColor } from "@/components/infolist/entries/types";
import type { BasemapPreset } from "@/components/map/presets/basemaps";
import type { CoordinateSystem } from "@/components/map/utils/coordinates";
import type { ColSpan } from "@/components/shared/grid";
import type { IconComponentType } from "@/components/shared/renderable";
import type { ResourceDefinition } from "@/lib/resource/types";

export type {
  SchemaCustomSpec,
  SchemaFieldsetSpec,
  SchemaGridSpec,
  SchemaNode,
  SchemaRendererProps,
  SchemaSectionSpec,
  SchemaTabSpec,
  SchemaTabsSpec,
} from "./containerTypes";

export type SchemaFieldType =
  | "text"
  | "textarea"
  | "password"
  | "select"
  | "number"
  | "slider"
  | "switch"
  | "date"
  | "dateRange"
  | "time"
  | "checkbox"
  | "checkboxGroup"
  | "combobox"
  | "radio"
  | "toggleButtons"
  | "rating"
  | "tags"
  | "masked"
  | "currency"
  | "otp"
  | "color"
  | "file"
  | "richEditor"
  | "cascader"
  | "treeSelect"
  | "keyValue"
  | "repeater"
  | "location";

export type SchemaEntryType =
  | "text"
  | "badge"
  | "date"
  | "currency"
  | "number"
  | "icon"
  | "image"
  | "color"
  | "keyValue"
  | "callout";

export interface SchemaEvaluationContext<TValues = Record<string, any>> {
  values: TValues;
  record?: TValues | null;
  isEditing: boolean;
  mode: "create" | "edit" | "view";
}

export interface SchemaOptionsFromResourceSpec<TOptionItem extends { id: string | number; name?: string } = any> {
  resource: ResourceDefinition<TOptionItem, any, any, TOptionItem[], any>;
  mapOption?: (item: TOptionItem) => { label: string; value: string };
  autoSelectFirst?: boolean;
}

export interface SchemaFieldSpec<TValues = Record<string, any>> {
  type: SchemaFieldType;
  name: string;
  label?: ReactNode;
  labelKey?: string;
  placeholder?: string;
  placeholderKey?: string;
  hint?: ReactNode;
  hintKey?: string;
  tooltip?: ReactNode;
  tooltipKey?: string;
  helperText?: ReactNode;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  colSpan?: ColSpan;
  /** 基于当前表单状态动态控制可见性与禁用态 */
  visibleWhen?: (ctx: SchemaEvaluationContext<TValues>) => boolean;
  disabledWhen?: (ctx: SchemaEvaluationContext<TValues>) => boolean;
  rows?: number;
  clearable?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  showCount?: boolean;
  maxLength?: number;
  mask?: string;
  unmask?: boolean;
  /** 创建态值变更时自动 slugify 到指定目标字段 */
  slugTarget?: string;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  formatValue?: (val: number) => string;
  showStrength?: boolean;
  autoComplete?: string;
  currency?: string;
  currencies?: string[];
  currencySymbol?: string;
  decimals?: number;
  allowNegative?: boolean;
  options?: readonly SelectOption[];
  toggleOptions?: ToggleButtonOption[];
  /** 从关联 ResourceDefinition 自动拉取下拉选项并在创建态选中首项 */
  optionsFromResource?: SchemaOptionsFromResourceSpec;
  searchPlaceholder?: string;
  emptyText?: string;
  direction?: "horizontal" | "vertical";
  card?: boolean;
  inline?: boolean;
  onLabel?: string;
  offLabel?: string;
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg" | "default";
  fullWidth?: boolean;
  count?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  showScore?: boolean;
  maxTags?: number;
  suggestions?: string[];
  dateFormat?: string;
  outputFormat?: "date" | "iso" | "string";
  length?: number;
  groupSize?: number;
  separator?: boolean;
  numericOnly?: boolean;
  presets?: readonly string[] | string[];
  showEyeDropper?: boolean;
  mode?: "grid" | "avatar";
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  endpoint?: string;
  paste?: boolean | "global";
  crop?: boolean;
  showDownload?: boolean;
  showRemove?: boolean;
  minHeight?: string | number;
  maxHeight?: string | number;
  editorClassName?: string;
  cascaderOptions?: CascaderOption[];
  loadData?: (target: any) => Promise<void> | void;
  changeOnSelect?: boolean;
  showSearch?: boolean;
  treeData?: TreeSelectNode[];
  treeCheckable?: boolean;
  treeLine?: boolean;
  onlyLeafSelectable?: boolean;
  keyLabel?: string;
  valueLabel?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  enableRawMode?: boolean;
  canAdd?: boolean;
  canDelete?: boolean;
  reorderable?: boolean;
  /** Repeater 专属配置 */
  repeaterLayout?: RepeaterLayout;
  headers?: RepeaterHeaderColumn[];
  createItem?: () => any;
  cloneItem?: (item: any) => any;
  renderItem?: (
    item: any,
    index: number,
    updateItem: (val: any) => void,
    helpers: RepeaterItemHelpers<any>,
  ) => ReactNode;
  itemTitle?: (item: any, index: number) => ReactNode;
  getItemKey?: (item: any, index: number) => string;
  addButtonText?: string;
  showEmptyAddButton?: boolean;
  minItems?: number;
  maxItems?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean | ((item: any, index: number) => boolean);
  canDuplicate?: boolean;
  confirmDelete?: boolean;
  itemErrors?: Record<number, string | string[]>;
  autoExpandOnError?: boolean;
  renderSummary?: (items: any[]) => ReactNode;
  renderExtraActions?: (helpers: RepeaterGlobalHelpers<any>) => ReactNode;
  height?: number | string;
  zoom?: number;
  basemap?: BasemapPreset;
  coordinateSystem?: CoordinateSystem;
  showCoordinatesInput?: boolean;
  showAddressSearch?: boolean;
  showCopyButton?: boolean;
}

export interface SchemaEntrySpec<TValues = Record<string, any>> {
  kind: "entry";
  entryType: SchemaEntryType;
  key?: string;
  name?: string;
  value?: unknown;
  /** 动态派生条目展示值（提供完整记录上下文类型推断） */
  resolveValue?: (ctx: SchemaEvaluationContext<TValues>) => unknown;
  label?: ReactNode;
  labelKey?: string;
  hint?: ReactNode;
  hintKey?: string;
  tooltip?: ReactNode;
  tooltipKey?: string;
  helperText?: ReactNode;
  placeholder?: ReactNode;
  colSpan?: ColSpan;
  inline?: boolean;
  className?: string;
  visibleWhen?: (ctx: SchemaEvaluationContext<TValues>) => boolean;
  color?: EntrySemanticColor | CalloutColor;
  colorMap?: Record<string, EntrySemanticColor>;
  labelMap?: Record<string, string>;
  currency?: string;
  decimals?: number;
  dateOptions?: DateTimeFormatOptions;
  prefix?: ReactNode;
  suffix?: ReactNode;
  copyable?: boolean | string;
  href?: string;
  openInNewTab?: boolean;
  icon?: IconComponentType | ReactNode | false;
  iconMap?: Record<string, IconComponentType>;
  text?: ReactNode;
  textKey?: string;
  alt?: string;
  shape?: "circular" | "rounded" | "square";
  size?: "sm" | "md" | "lg" | "xl";
  lightbox?: boolean;
  fallback?: ReactNode;
  showText?: boolean;
  variant?: "list" | "table";
  title?: ReactNode;
  titleKey?: string;
  description?: ReactNode;
  descriptionKey?: string;
  compact?: boolean;
  dismissible?: boolean;
  actions?: CalloutAction[];
}

export type SchemaTranslateFn = (key: string, values?: Record<string, unknown>) => string;
export type { AppFormContract };
