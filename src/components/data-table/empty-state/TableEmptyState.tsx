import { useTranslations } from "next-intl";
import { Inbox } from "lucide-react";
import { type ComponentType, isValidElement, memo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type {
  TableEmptyStateAction,
  TableEmptyStateIconColor,
  TableEmptyStateProps,
  TableEmptyStateSize,
} from "./types";

const ICON_COLOR_CLASSES: Record<TableEmptyStateIconColor, string> = {
  muted: "bg-muted/70 text-muted-foreground/80 border-border/50",
  primary: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const SIZE_CONFIGS: Record<
  TableEmptyStateSize,
  {
    containerClass: string;
    badgeClass: string;
    iconSizeClass: string;
    headingClass: string;
    descriptionClass: string;
    actionButtonSize: "xs" | "sm" | "default";
  }
> = {
  sm: {
    containerClass: "p-4 gap-2",
    badgeClass: "size-10",
    iconSizeClass: "size-5 stroke-[1.5]",
    headingClass: "text-xs font-semibold text-foreground",
    descriptionClass: "text-[11px] text-muted-foreground max-w-xs",
    actionButtonSize: "xs",
  },
  md: {
    containerClass: "p-6 gap-3",
    badgeClass: "size-12",
    iconSizeClass: "size-6 stroke-[1.5]",
    headingClass: "text-sm font-semibold text-foreground",
    descriptionClass: "text-xs text-muted-foreground max-w-sm",
    actionButtonSize: "sm",
  },
  lg: {
    containerClass: "p-8 gap-4",
    badgeClass: "size-14",
    iconSizeClass: "size-7 stroke-[1.5]",
    headingClass: "text-base font-semibold text-foreground",
    descriptionClass: "text-sm text-muted-foreground max-w-md",
    actionButtonSize: "default",
  },
};

export const TableEmptyState = memo(function TableEmptyState({
  heading,
  description,
  icon: IconProp = Inbox,
  iconColor = "muted",
  size = "md",
  actions,
  renderActions: customRenderActions,
  footer,
  className,
}: TableEmptyStateProps) {
  const t = useTranslations("table");
  const finalHeading = heading === undefined ? t("empty_heading") : heading;
  const finalDescription = description === undefined ? t("empty_description") : description;
  const sizeConfig = SIZE_CONFIGS[size] ?? SIZE_CONFIGS.md;
  const iconColorClass = ICON_COLOR_CLASSES[iconColor] ?? ICON_COLOR_CLASSES.muted;

  const renderIcon = () => {
    if (!IconProp) return null;
    if (isValidElement(IconProp)) {
      return IconProp;
    }
    const IconComponent = IconProp as ComponentType<{
      className?: string;
    }>;
    return <IconComponent className={sizeConfig.iconSizeClass} />;
  };

  const renderActions = () => {
    let actionNodes: ReactNode = null;
    if (isValidElement(actions)) {
      actionNodes = <div className="mt-1 flex items-center gap-2">{actions}</div>;
    } else if (Array.isArray(actions) && actions.length > 0) {
      actionNodes = (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {actions.map((action: TableEmptyStateAction, idx) => {
            const ActionIcon = action.icon;
            const buttonVariant = action.variant ?? (idx === 0 ? "default" : "outline");
            const buttonSize = action.size ?? sizeConfig.actionButtonSize;

            return (
              <Button
                key={`${action.label}-${idx}`}
                variant={buttonVariant}
                size={buttonSize}
                disabled={action.disabled}
                onClick={action.onClick}
                className={cn(
                  "gap-1.5 font-medium shadow-xs transition-transform active:scale-[0.98]",
                  action.className,
                )}
              >
                {ActionIcon && <ActionIcon className="size-3.5 shrink-0" />}
                <span>{action.label}</span>
              </Button>
            );
          })}
        </div>
      );
    }

    if (!actionNodes) return null;
    if (customRenderActions) {
      return customRenderActions(actionNodes);
    }
    return actionNodes;
  };

  return (
    <div
      data-slot="table-empty-state"
      className={cn(
        "flex w-full animate-in flex-col items-center justify-center text-center duration-200 fade-in-50 select-none",
        sizeConfig.containerClass,
        className,
      )}
    >
      {IconProp && (
        <div
          data-slot="empty-state-icon-badge"
          className={cn(
            "flex items-center justify-center rounded-full border shadow-2xs transition-colors",
            sizeConfig.badgeClass,
            iconColorClass,
          )}
        >
          {renderIcon()}
        </div>
      )}

      <div className="space-y-1 text-center">
        {finalHeading && (
          <p data-slot="empty-state-heading" className={sizeConfig.headingClass}>
            {finalHeading}
          </p>
        )}
        {finalDescription && (
          <p data-slot="empty-state-description" className={sizeConfig.descriptionClass}>
            {finalDescription}
          </p>
        )}
      </div>

      {renderActions()}

      {footer && (
        <div data-slot="empty-state-footer" className="text-muted-foreground/70 mt-1 text-xs">
          {footer}
        </div>
      )}
    </div>
  );
});
