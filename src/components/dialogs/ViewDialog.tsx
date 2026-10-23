import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { Edit, Loader2 } from "lucide-react";
import { memo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import type { ViewDialogProps } from "./types";

import { FullscreenToggle } from "./FullscreenToggle";
import { useDialogFullscreen } from "./hooks/useDialogFullscreen";
import {
  DIALOG_BODY_CLASS,
  DIALOG_FOOTER_CLASS,
  getDialogContentClassName,
  getSheetContentClassName,
} from "./sizeClasses";

interface ViewHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  extraActions?: ReactNode;
  onEdit?: () => void;
  editText: ReactNode;
  TitleComponent: React.ComponentType<{ className?: string; children?: ReactNode }>;
  DescriptionComponent: React.ComponentType<{ className?: string; children?: ReactNode }>;
}

const ViewHeader = memo(function ViewHeader({
  title,
  description,
  badge,
  extraActions,
  onEdit,
  editText,
  TitleComponent,
  DescriptionComponent,
}: ViewHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3 pr-6">
        <div className="flex items-center gap-2.5">
          <TitleComponent className="text-foreground text-lg font-semibold tracking-tight">{title}</TitleComponent>
          {badge ? <div>{badge}</div> : null}
        </div>
        <div className="flex items-center gap-2">
          {extraActions ?? null}
          {onEdit ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-8 gap-1.5 text-xs shadow-xs"
            >
              <Edit className="size-3.5" />
              <span>{editText}</span>
            </Button>
          ) : null}
        </div>
      </div>
      {description ? (
        <DescriptionComponent className="text-muted-foreground text-xs leading-normal">
          {description}
        </DescriptionComponent>
      ) : null}
    </div>
  );
});

export const ViewDialog = memo(function ViewDialog({
  open,
  onOpenChange,
  variant = "dialog",
  size = "md",
  widthClassName,
  title,
  description,
  badge,
  loading = false,
  onEdit,
  editText,
  closeText,
  extraActions,
  children,
  className,
  footerClassName,
  allowFullscreen = false,
  fullscreen: controlledFullscreen,
  onFullscreenChange,
}: ViewDialogProps) {
  const t = useTranslations("dialog");

  const { isFullscreen, toggleFullscreen } = useDialogFullscreen({
    open,
    fullscreen: controlledFullscreen,
    onFullscreenChange,
  });

  const resolvedTitle = title ?? t("view_title", { entityName: "Record" });
  const resolvedEditText = editText ?? t("edit");
  const resolvedCloseText = closeText ?? t("close");

  const handleClose = useMemoizedFn(() => {
    onOpenChange(false);
  });

  const contentBody = loading ? (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="text-primary size-6 animate-spin" />
    </div>
  ) : (
    children
  );

  /** 主体 + 吸底关闭按钮：Dialog / Sheet 仅底栏组件不同 */
  const renderPanel = (FooterComponent: React.ComponentType<{ className?: string; children?: ReactNode }>) => (
    <>
      <div className={DIALOG_BODY_CLASS}>{contentBody}</div>
      <FooterComponent className={cn(DIALOG_FOOTER_CLASS, footerClassName)}>
        <Button type="button" variant="outline" onClick={handleClose} className="h-8.5 px-4 text-xs font-medium">
          {resolvedCloseText}
        </Button>
      </FooterComponent>
    </>
  );

  if (variant === "sheet") {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className={getSheetContentClassName({ widthClassName, size, className })}>
          <SheetHeader className="border-border/60 border-b px-6 py-4">
            <ViewHeader
              title={resolvedTitle}
              description={description}
              badge={badge}
              extraActions={extraActions}
              onEdit={onEdit}
              editText={resolvedEditText}
              TitleComponent={SheetTitle}
              DescriptionComponent={SheetDescription}
            />
          </SheetHeader>

          {renderPanel(SheetFooter)}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={getDialogContentClassName({ isFullscreen, widthClassName, size, className })}>
        {allowFullscreen ? <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggleFullscreen} /> : null}

        <DialogHeader className="border-border/60 shrink-0 border-b px-6 py-4 pr-16">
          <ViewHeader
            title={resolvedTitle}
            description={description}
            badge={badge}
            extraActions={extraActions}
            onEdit={onEdit}
            editText={resolvedEditText}
            TitleComponent={DialogTitle}
            DescriptionComponent={DialogDescription}
          />
        </DialogHeader>

        {renderPanel(DialogFooter)}
      </DialogContent>
    </Dialog>
  );
});
