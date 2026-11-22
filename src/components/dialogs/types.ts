import type { ReactNode, SubmitEvent } from "react";

import type { AppFormContract } from "@/components/form/core/types";

export type DialogSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";

export type SurfacePresentation = "dialog" | "drawer" | "page";

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  active?: boolean;
}

export interface OverlayModalBaseProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Visual presentation variant: centered modal, sliding right drawer, or full route page */
  variant?: "dialog" | "sheet" | "page";
  /** Filament-style presentation alias ("drawer" -> "sheet") */
  presentation?: SurfacePresentation;
  size?: DialogSize;
  widthClassName?: string;
  title?: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  backTo?: string | (() => void);
  backLabel?: ReactNode;
  className?: string;
  footerClassName?: string;
  allowFullscreen?: boolean;
  fullscreen?: boolean;
  onFullscreenChange?: (fullscreen: boolean) => void;
}

export type BaseDialogProps = OverlayModalBaseProps;

export type FormDialogMode = "create" | "edit";

export interface FormDialogProps<TData = Record<string, unknown>> extends OverlayModalBaseProps {
  form?: AppFormContract;
  defaultValues?: Record<string, unknown>;
  mode?: FormDialogMode;
  entity?: TData | null;
  entityName?: string;
  createTitle?: ReactNode;
  editTitle?: ReactNode;
  submitText?: ReactNode;
  createSubmitText?: ReactNode;
  editSubmitText?: ReactNode;
  cancelText?: ReactNode;
  saveAndContinueText?: ReactNode;
  onSaveAndContinue?: () => void | Promise<void>;
  isSubmitting?: boolean;
  loading?: boolean;
  isSubmitDisabled?: boolean;
  isDirty?: boolean;
  enableDirtyGuard?: boolean;
  onSubmit?: (e?: SubmitEvent<HTMLFormElement>) => void | Promise<void>;
  onCancel?: () => void;
  children: ReactNode;
  extraFooterActions?: ReactNode;
  extraActions?: ReactNode;
}

export interface ViewDialogProps extends OverlayModalBaseProps {
  loading?: boolean;
  onEdit?: () => void;
  editText?: ReactNode;
  closeText?: ReactNode;
  extraActions?: ReactNode;
  children: ReactNode;
}
