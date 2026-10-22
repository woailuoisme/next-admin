import { useMemoizedFn } from "ahooks";
import { Loader2 } from "lucide-react";
import { memo, type SubmitEvent, useEffect, useId, useMemo, useRef } from "react";

import { FormContext } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import type { FormDialogProps } from "./types";

import { FullscreenToggle } from "./FullscreenToggle";
import { useDialogFullscreen } from "./hooks/useDialogFullscreen";
import { DIALOG_SIZE_CLASSES, SHEET_SIZE_CLASSES } from "./size-classes";

export const FormDialog = memo(function FormDialog<TData = Record<string, unknown>>({
  open,
  onOpenChange,
  variant = "dialog",
  widthClassName,
  mode,
  entity,
  form,
  defaultValues,
  entityName = "Record",
  title,
  createTitle,
  editTitle,
  description,
  size = "md",
  submitText,
  createSubmitText,
  editSubmitText,
  cancelText = "Cancel",
  isSubmitting = false,
  isSubmitDisabled = false,
  onSubmit,
  children,
  extraFooterActions,
  className,
  footerClassName,
  allowFullscreen = false,
  fullscreen: controlledFullscreen,
  onFullscreenChange,
}: FormDialogProps<TData>) {
  const formId = useId();
  const isEdit = mode ? mode === "edit" : Boolean(entity);

  const { isFullscreen, toggleFullscreen } = useDialogFullscreen({
    open,
    fullscreen: controlledFullscreen,
    onFullscreenChange,
  });

  const prevOpenRef = useRef(false);
  const prevEntityIdRef = useRef<unknown>(undefined);

  // Synchronize entity / defaultValues into form only when dialog opens or entity ID changes
  useEffect(() => {
    if (!open || !form) {
      prevOpenRef.current = open;
      return;
    }

    const currentEntityId =
      entity && typeof entity === "object"
        ? ((entity as Record<string, unknown>).id ?? (entity as Record<string, unknown>)._id ?? undefined)
        : entity;
    const justOpened = !prevOpenRef.current && open;
    const entityChanged =
      currentEntityId !== undefined &&
      prevEntityIdRef.current !== undefined &&
      prevEntityIdRef.current !== currentEntityId;

    if (justOpened || entityChanged) {
      form.reset();
      const currentDefaultValues = defaultValues;
      if (entity && typeof entity === "object") {
        const entityRecord = entity as Record<string, unknown>;
        const allKeys = new Set([...Object.keys(currentDefaultValues ?? {}), ...Object.keys(entityRecord)]);
        for (const key of allKeys) {
          const val = entityRecord[key] ?? currentDefaultValues?.[key];
          if (val !== undefined) {
            form.setFieldValue(key, val);
          }
        }
      } else if (currentDefaultValues) {
        for (const [key, val] of Object.entries(currentDefaultValues)) {
          form.setFieldValue(key, val);
        }
      }
    }

    prevOpenRef.current = open;
    prevEntityIdRef.current = currentEntityId;
  }, [open, entity, form, defaultValues]);

  const resolvedTitle =
    title ?? (isEdit ? (editTitle ?? `Edit ${entityName}`) : (createTitle ?? `Add New ${entityName}`));

  const resolvedSubmitText =
    submitText ??
    (isEdit ? (editSubmitText ?? "Save Changes") : (createSubmitText ?? `Create ${entityName}`));

  const formContextValue = useMemo(() => ({ form }), [form]);

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  });

  const handleCancel = useMemoizedFn(() => {
    onOpenChange(false);
  });

  const handleFormSubmit = useMemoizedFn((e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSubmit) {
      onSubmit(e);
    } else if (form?.handleSubmit) {
      form.handleSubmit();
    }
  });

  const renderFormContent = (
    FooterComponent: React.ComponentType<{
      className?: string;
      children?: React.ReactNode;
    }>,
  ) => (
    // 本组件拥有 <form> 元素（吸底提交按钮位于其内部并依赖原生提交）
    // children 只能是字段内容，严禁再渲染 form / <Form as="form">，否则会嵌套 <form> 导致 hydration 报错
    <form id={formId} onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
        <FormContext value={formContextValue}>{children}</FormContext>
      </div>

      <FooterComponent
        className={cn(
          "sticky bottom-0 z-10 m-0 flex shrink-0 flex-row items-center justify-end gap-2.5 border-t border-border/70 bg-muted/30 p-0 px-6 py-3.5 dark:bg-muted/15",
          footerClassName,
        )}
      >
        {extraFooterActions ? (
          <div className="mr-auto flex items-center gap-2">{extraFooterActions}</div>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="h-8.5 px-4 text-xs font-medium"
        >
          {cancelText}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isSubmitDisabled}
          className="h-8.5 px-4 text-xs font-medium shadow-xs"
        >
          {isSubmitting ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : null}
          {resolvedSubmitText}
        </Button>
      </FooterComponent>
    </form>
  );

  if (variant === "sheet") {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className={cn(
            "flex flex-col gap-0 overflow-hidden p-0",
            widthClassName || SHEET_SIZE_CLASSES[size],
            className,
          )}
        >
          <SheetHeader className="border-border/60 shrink-0 border-b px-6 py-4 pr-16">
            <SheetTitle>{resolvedTitle}</SheetTitle>
            {description ? (
              <SheetDescription className="text-muted-foreground text-xs leading-normal">
                {description}
              </SheetDescription>
            ) : null}
          </SheetHeader>
          {renderFormContent(SheetFooter)}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0 transition-all duration-200",
          isFullscreen
            ? "h-[96vh] max-h-[96vh] w-[98vw] sm:max-w-[98vw]"
            : "max-h-[calc(100dvh-2.5rem)] sm:max-h-[88vh]",
          !isFullscreen && (widthClassName || DIALOG_SIZE_CLASSES[size]),
          className,
        )}
      >
        {allowFullscreen ? (
          <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
        ) : null}

        <DialogHeader className="border-border/60 shrink-0 border-b px-6 py-4 pr-16">
          <DialogTitle>{resolvedTitle}</DialogTitle>
          {description ? (
            <DialogDescription className="text-muted-foreground text-xs leading-normal">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        {renderFormContent(DialogFooter)}
      </DialogContent>
    </Dialog>
  );
});
