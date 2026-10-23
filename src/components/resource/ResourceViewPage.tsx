import { useTranslations } from "next-intl";
import { Edit, Loader2 } from "lucide-react";
import { memo } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ResourceViewHostProps } from "./types";

import { ResourcePageHeader } from "./ResourcePageHeader";
import { useResourceBackNavigation } from "./useResourceBackNavigation";

export const ResourceViewPage = memo(function ResourceViewPage({
  title,
  description,
  badge,
  breadcrumbs,
  backTo,
  backLabel,
  onEdit,
  editText,
  closeText,
  loading = false,
  extraActions,
  footerClassName,
  className,
  children,
}: Omit<ResourceViewHostProps, "presentation" | "open" | "onOpenChange" | "size">) {
  const t = useTranslations("resource");
  const handleBack = useResourceBackNavigation(backTo);

  const resolvedEditText = editText ?? t("edit");
  const resolvedCloseText = closeText ?? t("back_to_list");

  const headerActions = (
    <div className="flex items-center gap-2">
      {extraActions}
      {onEdit ? (
        <Button type="button" variant="outline" size="sm" onClick={onEdit} className="h-8 gap-1.5 text-xs shadow-xs">
          <Edit className="size-3.5" />
          <span>{resolvedEditText}</span>
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className={cn("mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8", className)}>
      <ResourcePageHeader
        title={title}
        description={description}
        badge={badge}
        breadcrumbs={breadcrumbs}
        backTo={backTo}
        backLabel={backLabel}
        extraActions={headerActions}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="text-primary size-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">{children}</div>
      )}

      <div className={cn("flex items-center justify-between border-t border-border/70 pt-4", footerClassName)}>
        <Button type="button" variant="outline" onClick={handleBack} className="h-8.5 px-4 text-xs font-medium">
          {resolvedCloseText}
        </Button>
      </div>
    </div>
  );
});
