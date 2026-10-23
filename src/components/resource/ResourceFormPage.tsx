import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { Loader2 } from "lucide-react";
import { memo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ResourceFormHostProps } from "./types";

import { ResourcePageHeader } from "./ResourcePageHeader";
import { useResourceBackNavigation } from "./useResourceBackNavigation";

export const ResourceFormPage = memo(function ResourceFormPage({
  title,
  description,
  badge,
  breadcrumbs,
  backTo,
  backLabel,
  submitText,
  cancelText,
  saveAndContinueText,
  onSaveAndContinue,
  isSubmitting = false,
  isSubmitDisabled = false,
  isDirty = false,
  enableDirtyGuard = true,
  onSubmit,
  onCancel,
  extraActions,
  footerClassName,
  className,
  children,
}: Omit<ResourceFormHostProps, "presentation" | "open" | "onOpenChange" | "size">) {
  const t = useTranslations("resource");
  const goBack = useResourceBackNavigation(backTo);

  const resolvedSubmitText = submitText ?? t("save_changes");
  const resolvedCancelText = cancelText ?? t("cancel");
  const resolvedSaveAndContinueText = saveAndContinueText ?? t("save_and_continue");

  // 浏览器刷新/关闭未保存拦截
  useEffect(() => {
    if (!enableDirtyGuard || !isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enableDirtyGuard, isDirty]);

  const handleCancel = useMemoizedFn(() => {
    if (enableDirtyGuard && isDirty && !window.confirm(t("unsaved_changes_confirm"))) {
      return;
    }

    if (onCancel) {
      onCancel();
    } else {
      goBack();
    }
  });

  return (
    <div className={cn("mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8", className)}>
      <ResourcePageHeader
        title={title}
        description={description}
        badge={badge}
        breadcrumbs={breadcrumbs}
        backTo={backTo}
        backLabel={backLabel}
        extraActions={extraActions}
      />

      {/* 本组件拥有 <form> 元素：children 只能是字段内容，严禁再嵌套 form / <Form as="form"> */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="min-h-[300px] space-y-6">{children}</div>

        {/* 工业级吸底固定操作栏 (Sticky Bottom Bar) */}
        <div
          className={cn(
            "sticky bottom-0 z-20 -mx-4 flex flex-row items-center justify-between gap-3 border-t border-border/70 bg-background/85 px-4 py-3.5 backdrop-blur-md transition-all sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
            footerClassName,
          )}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground h-8.5 px-3.5 text-xs"
          >
            {resolvedCancelText}
          </Button>

          <div className="flex items-center gap-2.5">
            {onSaveAndContinue ? (
              <Button
                type="button"
                variant="outline"
                onClick={onSaveAndContinue}
                disabled={isSubmitting || isSubmitDisabled}
                className="h-8.5 px-4 text-xs font-medium"
              >
                {isSubmitting ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : null}
                {resolvedSaveAndContinueText}
              </Button>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting || isSubmitDisabled}
              className="h-8.5 px-4 text-xs font-medium shadow-xs"
            >
              {isSubmitting ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : null}
              {resolvedSubmitText}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
});
