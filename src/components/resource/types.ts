import type { ReactNode, SubmitEvent } from "react";

import type { ModalKeyMapping } from "@/components/dialogs/hooks/useResourceModalState";
import type { DialogSize } from "@/components/dialogs/types";

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
   * Allow fullscreen toggle in Dialog mode.
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
   * Whether to enable dirty check guard to prevent accidental navigation. Defaults to true for page mode.
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

export interface ResourceOperationsConfig {
  /**
   * Base route path for page mode navigation (e.g. "/products" or "/orders").
   */
  basePath?: string;
  /**
   * Presentation modes for each operation.
   * Can be specified individually per action, or a single presentation mode for all.
   */
  presentation?:
    | {
        create?: ResourcePresentation;
        edit?: ResourcePresentation;
        view?: ResourcePresentation;
      }
    | ResourcePresentation;
  /**
   * Whether to sync operation states with URL search parameters.
   */
  syncWithUrl?: boolean;
  /**
   * URL search parameter key mappings for modal/drawer states.
   */
  keys?: ModalKeyMapping;
  /**
   * External callbacks.
   */
  onCreate?: () => void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}
