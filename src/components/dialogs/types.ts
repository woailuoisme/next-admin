import type { ReactNode, SubmitEvent } from "react";

export type DialogSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";

export interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  /**
   * Optional custom CSS class name for the dialog footer container.
   */
  footerClassName?: string;
  /**
   * Whether to render a full-screen / maximize toggle button in the dialog header.
   */
  allowFullscreen?: boolean;
  /**
   * Controlled full-screen state.
   */
  fullscreen?: boolean;
  /**
   * Callback fired when full-screen state toggles.
   */
  onFullscreenChange?: (fullscreen: boolean) => void;
}

export type FormDialogMode = "create" | "edit";

export interface BaseFormInstance {
  reset: () => void;
  setFieldValue: (field: any, value: any) => void;
  handleSubmit?: () => void | Promise<void>;
  [key: string]: unknown;
}

export interface FormDialogProps<TData = Record<string, unknown>> extends BaseDialogProps {
  /**
   * TanStack Form instance to bind. If provided, automatically syncs entity data on open,
   * provides FormContext to child fields, and handles submit if onSubmit is omitted.
   */
  form?: BaseFormInstance | any;
  /**
   * Default fallback values when resetting or creating an entity.
   */
  defaultValues?: Record<string, unknown>;
  /**
   * Visual presentation variant: standard centered dialog or sliding right sheet drawer.
   * Defaults to "dialog".
   */
  variant?: "dialog" | "sheet";
  /**
   * Optional custom width class override (e.g. "sm:max-w-xl").
   */
  widthClassName?: string;
  /**
   * Explicit dialog mode or auto-inferred from entity/initialData presence.
   */
  mode?: FormDialogMode;
  /**
   * Entity data for edit mode. If provided and mode is omitted, mode defaults to "edit".
   */
  entity?: TData | null;
  /**
   * Name of the entity, e.g. "Product", "Category", "Staff Member".
   * Used to auto-infer title and submit button text.
   */
  entityName?: string;
  /**
   * Explicit title override when in create mode.
   */
  createTitle?: ReactNode;
  /**
   * Explicit title override when in edit mode.
   */
  editTitle?: ReactNode;
  /**
   * Size of the dialog modal window. Defaults to "md" (max-w-lg).
   */
  size?: DialogSize;
  /**
   * Custom text for the submit button. Defaults to "Create ${entityName}" or "Save Changes".
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
   * Custom text for the cancel button. Defaults to "Cancel".
   */
  cancelText?: ReactNode;
  /**
   * Whether the form is currently submitting an async mutation.
   * When true, disables cancel/close and displays a loading spinner on the submit button.
   */
  isSubmitting?: boolean;
  /**
   * Whether the submit button is disabled.
   */
  isSubmitDisabled?: boolean;
  /**
   * Form submit handler. Receives the form submit event.
   */
  onSubmit?: (e?: SubmitEvent<HTMLFormElement>) => void | Promise<void>;
  /**
   * Form fields and inputs.
   */
  children: ReactNode;
  /**
   * Optional extra actions placed on the left side of the footer.
   */
  extraFooterActions?: ReactNode;
}

export interface ViewDialogProps extends BaseDialogProps {
  /**
   * Visual variant: standard centered dialog or sliding right sheet drawer.
   * Defaults to "dialog".
   */
  variant?: "dialog" | "sheet";
  /**
   * Size of the modal or sheet. Defaults to "md".
   */
  size?: DialogSize;
  /**
   * Optional custom width class override (e.g. "sm:max-w-md").
   */
  widthClassName?: string;
  /**
   * Optional status badge displayed next to the title.
   */
  badge?: ReactNode;
  /**
   * Whether content is loading. If true, displays a centered loader spinner.
   */
  loading?: boolean;
  /**
   * Optional edit callback. If provided, renders an "Edit" button in the header/footer.
   */
  onEdit?: () => void;
  /**
   * Custom text for the edit button. Defaults to "Edit".
   */
  editText?: ReactNode;
  /**
   * Custom text for the close button. Defaults to "Close".
   */
  closeText?: ReactNode;
  /**
   * Additional header action elements.
   */
  extraActions?: ReactNode;
  /**
   * Content to display.
   */
  children: ReactNode;
}

export interface DataListItem {
  label: ReactNode;
  value?: ReactNode;
  copyable?: boolean;
  badge?: boolean;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  span?: number;
  className?: string;
}

export interface DataListProps {
  items: DataListItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  size?: "sm" | "default";
}

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityName?: string;
  entityTitle?: ReactNode;
  itemCount?: number;
  title?: ReactNode;
  description?: ReactNode;
  confirmText?: ReactNode;
  cancelText?: ReactNode;
  isPending?: boolean;
  requireConfirmKeyword?: boolean | string;
  confirmKeyword?: string;
  /**
   * Whether to auto-focus the confirmation keyword input on open. Defaults to true.
   */
  autoFocusInput?: boolean;
  className?: string;
  onConfirm: () => Promise<void> | void;
}
