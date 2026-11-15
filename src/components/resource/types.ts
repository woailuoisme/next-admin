import type { LucideIcon } from "lucide-react";
import type { NumberFormatOptions } from "next-intl";
import type { ComponentType, ReactNode, SubmitEvent } from "react";

import type {
  DataTableColDef,
  DataTableFilterDefinition,
  DataTablePinnedColumns,
  DataTableSlotProps,
} from "@/components/data-table/core/types";
import type { BaseFormInstance, DialogSize } from "@/components/dialogs/types";
import type { SparklineLayout, StatCardTheme, StatDensity } from "@/components/stats/shared/types";
import type { StatCardTrendData } from "@/components/stats/stat-card/types";
import type { UseResourceOptionsForm } from "@/lib/resource/hooks";
import type { ResourceActionName, ResourceCustomAction, ResourceDefinition } from "@/lib/resource/types";
import type { ResourceSubPageRenderProps } from "@/lib/resource/nextServerPage";

/**
 * Presentation mode for resource operations (Filament v5 style).
 * - "dialog": Centered modal dialog window.
 * - "drawer": Right-side sliding panel / sheet (SlideOver).
 * - "page": Independent, full-screen dedicated route page with breadcrumbs and sticky actions.
 */
export type ResourcePresentation = "dialog" | "drawer" | "page";

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  active?: boolean;
}

export interface ResourceFormHostProps<TData = Record<string, unknown>> {
  /**
   * Presentation mode for the form.
   * Defaults to "dialog".
   */
  presentation?: ResourcePresentation;
  /**
   * Modal/Drawer visibility state. Ignored when presentation is "page".
   */
  open?: boolean;
  /**
   * Callback when modal/drawer open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * TanStack Form instance to bind across dialog, drawer, and page modes.
   */
  form?: BaseFormInstance;
  /**
   * Default fallback values when resetting or creating an entity.
   */
  defaultValues?: Record<string, unknown>;
  /**
   * Form mode: "create" or "edit".
   */
  mode?: "create" | "edit";
  /**
   * Entity data for edit mode.
   */
  entity?: TData | null;
  /**
   * Entity name used to infer default titles and buttons (e.g. "Customer", "Product").
   */
  entityName?: string;
  /**
   * Title of the form.
   */
  title?: ReactNode;
  /**
   * Explicit title override when in create mode.
   */
  createTitle?: ReactNode;
  /**
   * Explicit title override when in edit mode.
   */
  editTitle?: ReactNode;
  /**
   * Optional subtitle / description.
   */
  description?: ReactNode;
  /**
   * Optional status badge displayed beside the title.
   */
  badge?: ReactNode;
  /**
   * Dialog or Drawer size.
   */
  size?: DialogSize;
  /**
   * Custom width class override.
   */
  widthClassName?: string;
  /**
   * Additional CSS class for the container.
   */
  className?: string;
  /**
   * Custom CSS class for the footer actions container.
   */
  footerClassName?: string;
  /**
   * Allow fullscreen toggle in Dialog or Drawer mode.
   */
  allowFullscreen?: boolean;
  /**
   * Controlled fullscreen state.
   */
  fullscreen?: boolean;
  /**
   * Callback fired on fullscreen toggle.
   */
  onFullscreenChange?: (fullscreen: boolean) => void;

  // --- Page Mode Specific Properties ---
  /**
   * Breadcrumbs items rendered on top of the page.
   */
  breadcrumbs?: BreadcrumbItem[];
  /**
   * Back link path or custom callback.
   */
  backTo?: string | (() => void);
  /**
   * Custom label for the back button. Defaults to "Back".
   */
  backLabel?: ReactNode;

  // --- Action Handlers & Button Texts ---
  /**
   * Text for the submit button. Defaults to "Create Record" or "Save Changes".
   */
  submitText?: ReactNode;
  /**
   * Custom submit button text in create mode.
   */
  createSubmitText?: ReactNode;
  /**
   * Custom submit button text in edit mode.
   */
  editSubmitText?: ReactNode;
  /**
   * Text for the cancel/close button. Defaults to "Cancel".
   */
  cancelText?: ReactNode;
  /**
   * Text for the "Save & Continue Editing" button (Filament signature feature).
   */
  saveAndContinueText?: ReactNode;
  /**
   * Optional handler for "Save & Continue Editing".
   */
  onSaveAndContinue?: () => void | Promise<void>;
  /**
   * Whether the form is currently submitting an async mutation.
   */
  isSubmitting?: boolean;
  /**
   * Whether the submit button is disabled.
   */
  isSubmitDisabled?: boolean;
  /**
   * Whether the form has unsaved modifications (used for dirty guard protection).
   */
  isDirty?: boolean;
  /**
   * Whether to enable dirty check guard to prevent accidental navigation.
   */
  enableDirtyGuard?: boolean;
  /**
   * Form submit handler.
   */
  onSubmit?: (e?: SubmitEvent<HTMLFormElement>) => void | Promise<void>;
  /**
   * Cancel handler.
   */
  onCancel?: () => void;
  /**
   * Extra action buttons placed beside the main actions.
   */
  extraActions?: ReactNode;
  /**
   * Form fields and contents.
   */
  children: ReactNode;
}

export interface ResourceViewHostProps {
  /**
   * Presentation mode for the details view.
   * Defaults to "dialog".
   */
  presentation?: ResourcePresentation;
  /**
   * Modal/Drawer visibility state. Ignored when presentation is "page".
   */
  open?: boolean;
  /**
   * Callback when modal/drawer open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Title of the view.
   */
  title?: ReactNode;
  /**
   * Optional subtitle / description.
   */
  description?: ReactNode;
  /**
   * Status badge displayed beside the title.
   */
  badge?: ReactNode;
  /**
   * Dialog or Drawer size.
   */
  size?: DialogSize;
  /**
   * Custom width class override.
   */
  widthClassName?: string;
  /**
   * Container CSS class.
   */
  className?: string;
  /**
   * Custom CSS class for footer actions container.
   */
  footerClassName?: string;
  /**
   * Allow fullscreen toggle in Dialog or Drawer mode.
   */
  allowFullscreen?: boolean;
  /**
   * Controlled fullscreen state.
   */
  fullscreen?: boolean;
  /**
   * Callback fired on fullscreen toggle.
   */
  onFullscreenChange?: (fullscreen: boolean) => void;
  /**
   * Breadcrumbs items for page mode.
   */
  breadcrumbs?: BreadcrumbItem[];
  /**
   * Back link path or custom callback.
   */
  backTo?: string | (() => void);
  /**
   * Custom label for back button.
   */
  backLabel?: ReactNode;
  /**
   * Edit action callback. If provided, renders an "Edit" button.
   */
  onEdit?: () => void;
  /**
   * Text for the Edit button. Defaults to "Edit".
   */
  editText?: ReactNode;
  /**
   * Text for the close button. Defaults to "Close".
   */
  closeText?: ReactNode;
  /**
   * Whether data is loading.
   */
  loading?: boolean;
  /**
   * Extra action buttons.
   */
  extraActions?: ReactNode;
  /**
   * Details content or infolist.
   */
  children: ReactNode;
}

export type ResourceTranslateFn = (key: string, values?: Record<string, unknown>) => string;

export interface StatItemSpec {
  id: string;
  title: string;
  value: number | string | null;
  prefix?: ReactNode;
  suffix?: ReactNode;
  formatOptions?: NumberFormatOptions;
  icon?: LucideIcon;
  theme?: StatCardTheme;
  description?: string;
  trend?: StatCardTrendData;
  sparklineData?: number[];
  sparklineType?: "area" | "bar";
}

export interface ResourceStatsSchema<TItem, TListResponse> {
  columns?: 2 | 3 | 4;
  density?: StatDensity;
  sparklineLayout?: SparklineLayout;
  build: (ctx: {
    rows: TItem[];
    total: number;
    rawResponse: TListResponse | undefined;
    t: ResourceTranslateFn;
  }) => StatItemSpec[];
}

export type ResourceBatchActionSpec<
  TItem,
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
> =
  | {
      id: string;
      kind: "batchDelete";
      label: (ctx: { selectedCount: number; t: ResourceTranslateFn }) => string;
      icon?: LucideIcon;
      variant?: "outline" | "destructive" | "secondary";
    }
  | {
      id: string;
      kind: "exportJson";
      label: (ctx: { selectedCount: number; t: ResourceTranslateFn }) => string;
      exportFileName: (selectedCount: number) => string;
      icon?: LucideIcon;
      variant?: "outline" | "destructive" | "secondary";
    }
  | {
      id: string;
      kind: "action";
      actionKey: keyof TActions & string;
      mapVars: (item: TItem) => unknown;
      label: (ctx: { selectedCount: number; t: ResourceTranslateFn }) => string;
      permission?: ResourceActionName;
      icon?: LucideIcon;
      variant?: "outline" | "destructive" | "secondary";
    }
  | {
      id: string;
      kind?: "custom";
      label: (ctx: { selectedCount: number; t: ResourceTranslateFn }) => string;
      icon?: LucideIcon;
      variant?: "outline" | "destructive" | "secondary";
      permission?: ResourceActionName;
      onClick: (selectedRows: TItem[], clearSelection: () => void) => void | Promise<void>;
    };

export interface ResourceFormInstance extends BaseFormInstance, UseResourceOptionsForm {
  Field: any;
  Subscribe?: any;
}

export interface ResourceFormSlotContext<TItem> {
  form: ResourceFormInstance;
  mode: "create" | "edit";
  entity: TItem | null;
  isEditing: boolean;
  isSubmitting: boolean;
}

export interface ResourceViewSlotContext<TItem> {
  entity: TItem | null;
  isLoading: boolean;
}

/**
 * Scaffold 与 SubPageScaffold 共享的表单/详情渲染与元信息适配器契约
 */
export interface ResourceContentAdapters<TItem, TInput = Record<string, unknown>> {
  resolveFormDefaults?: (entity: TItem | null) => TInput;
  viewTitle?: (entity: TItem | null) => ReactNode;
  viewDescription?: (entity: TItem | null) => ReactNode;
  viewBadge?: (entity: TItem | null) => ReactNode;
  renderForm?: (ctx: ResourceFormSlotContext<TItem>) => ReactNode;
  renderView?: (ctx: ResourceViewSlotContext<TItem>) => ReactNode;
}

export interface ResourceQuickActionSpec<
  TItem,
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
> {
  id: string;
  label: string;
  ariaLabel?: string;
  icon?: ComponentType<{ className?: string }>;
  tooltip?: ReactNode;
  destructive?: boolean;
  permission?: ResourceActionName;
  hidden?: boolean | ((row: TItem) => boolean);
  disabled?: boolean | ((row: TItem) => boolean);
  onClick: (
    row: TItem,
    ctx: {
      runAction: <K extends keyof TActions & string>(
        actionKey: K,
        vars: TActions[K] extends ResourceCustomAction<infer V, any> ? V : never,
      ) => void;
      isActionPending: boolean;
    },
  ) => void;
}

export interface ResourceRowActionsSchema<
  TItem,
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
> {
  field?: string;
  headerName?: string;
  width?: number;
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
  pinned?: "left" | "right" | false;
  maxQuickActions?: number;
  moreActionsLabel?: string;
  crud?: {
    view?: boolean;
    edit?: boolean;
    delete?: boolean;
    viewLabel?: string;
    editLabel?: string;
    deleteLabel?: string;
  };
  quick?: ResourceQuickActionSpec<TItem, TActions>[];
  dropdown?: ResourceQuickActionSpec<TItem, TActions>[];
}

export interface ResourceTableColumnsContext<
  TItem,
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
> {
  t: ResourceTranslateFn;
  openView: (id: string) => void;
  openEdit: (id: string) => void;
  openDelete: (target: string | string[], items?: TItem[]) => void;
  runAction: <K extends keyof TActions & string>(
    actionKey: K,
    vars: TActions[K] extends ResourceCustomAction<infer V, any> ? V : never,
  ) => void;
  isActionPending: boolean;
}

export interface ResourceTableSchema<
  TItem extends { id: string | number },
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
> {
  columns: (ctx: ResourceTableColumnsContext<TItem, TActions>) => DataTableColDef<TItem>[];
  rowActions?:
    | ResourceRowActionsSchema<TItem, TActions>
    | ((t: ResourceTranslateFn) => ResourceRowActionsSchema<TItem, TActions>);
  filters?: (t: ResourceTranslateFn) => DataTableFilterDefinition[];
  pinnedColumns?: DataTablePinnedColumns;
  exportFileName?: string;
  slotProps?: DataTableSlotProps;
  checkboxSelection?: boolean;
  onRowClick?: "view" | ((row: TItem, ctx: { openView: (id: string) => void; openEdit: (id: string) => void }) => void);
  batchActions?: ResourceBatchActionSpec<TItem, TActions>[];
  getRowId?: (row: TItem) => string;
}

export interface ResourceOptionsFromResourceSpec<TOptionItem extends { id: string | number; name?: string } = any> {
  resource: ResourceDefinition<TOptionItem, any, any, TOptionItem[], any>;
  mapOption?: (item: TOptionItem) => { label: string; value: string };
  autoSelectFirst?: boolean;
}

export interface ResourceFormFieldSpec {
  type: "text" | "textarea" | "select";
  name: string;
  labelKey?: string;
  label?: ReactNode;
  placeholderKey?: string;
  placeholder?: string;
  hintKey?: string;
  tooltipKey?: string;
  required?: boolean;
  colSpan?: 1 | 2 | 3;
  rows?: number;
  clearable?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  showCount?: boolean;
  maxLength?: number;
  /** 创建态值变更时自动 slugify 到指定目标字段 */
  slugTarget?: string;
  options?: readonly { label: string; value: string }[];
  /** 从关联 ResourceDefinition 自动拉取下拉选项并在创建态选中首项 */
  optionsFromResource?: ResourceOptionsFromResourceSpec;
}

export interface ResourceFormConfig<TItem> {
  size?: DialogSize;
  fields?: ResourceFormFieldSpec[];
  render?: (ctx: ResourceFormSlotContext<TItem>) => ReactNode;
}

export interface ResourceInfolistConfig<TItem> {
  size?: DialogSize;
  title?: (entity: TItem | null, t: ResourceTranslateFn) => ReactNode;
  description?: (entity: TItem | null, t: ResourceTranslateFn) => ReactNode;
  badge?: (entity: TItem | null, t: ResourceTranslateFn) => ReactNode;
  render: (ctx: { entity: TItem | null; isLoading: boolean; t: ResourceTranslateFn }) => ReactNode;
}

export interface ResourceUIConfig<
  TItem extends { id: string | number },
  TFilters = Record<string, unknown>,
  TListResponse = { items: TItem[]; total: number },
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
> {
  allowFullscreen?: boolean;
  headerExtra?: (t: ResourceTranslateFn) => ReactNode;
  stats?: ResourceStatsSchema<TItem, TListResponse>;
  table: ResourceTableSchema<TItem, TActions>;
  form?: ResourceFormConfig<TItem>;
  infolist?: ResourceInfolistConfig<TItem>;
  /** 仅供泛型约束推断保留，无需显式传值 */
  readonly __filters?: TFilters;
}

export interface ResourceUIBundle<
  TItem extends { id: string | number },
  TInput extends Record<string, unknown> = Record<string, unknown>,
  TFilters = Record<string, unknown>,
  TListResponse = { items: TItem[]; total: number },
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
> {
  readonly resource: ResourceDefinition<TItem, TInput, TFilters, TListResponse, TActions>;
  readonly config: ResourceUIConfig<TItem, TFilters, TListResponse, TActions>;
  readonly ListView: ComponentType<{ search?: TFilters }>;
  readonly ActionView: ComponentType<ResourceSubPageRenderProps>;
}
