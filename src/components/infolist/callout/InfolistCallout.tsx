"use client";

import { useTranslations } from "next-intl";
import { AlertOctagon, AlertTriangle, CheckCircle2, HelpCircle, Info, Sparkles, X } from "lucide-react";
import * as React from "react";

import { COL_SPAN_CLASSES } from "@/components/shared/grid";
import { sanitizeUrl } from "@/components/shared/url";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

import type { CalloutAction, CalloutColor, CalloutProps } from "./types";

import { hasRenderableNode } from "../core/utils";

const defaultIcons: Record<CalloutColor, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  primary: Sparkles,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertOctagon,
  neutral: HelpCircle,
};

const calloutColorStyles: Record<
  CalloutColor,
  {
    container: string;
    icon: string;
    title: string;
    actionDefault: string;
  }
> = {
  primary: {
    container: "border-primary/20 bg-primary/5 text-foreground dark:bg-primary/10",
    icon: "text-primary",
    title: "text-primary",
    actionDefault: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  info: {
    container: "border-chart-1/30 bg-chart-1/10 text-foreground dark:bg-chart-1/15",
    icon: "text-chart-1",
    title: "text-chart-1",
    actionDefault: "border border-chart-1/30 bg-chart-1/15 text-foreground hover:bg-chart-1/25",
  },
  success: {
    container: "border-chart-2/30 bg-chart-2/10 text-foreground dark:bg-chart-2/15",
    icon: "text-chart-2",
    title: "text-chart-2",
    actionDefault: "border border-chart-2/30 bg-chart-2/15 text-foreground hover:bg-chart-2/25",
  },
  warning: {
    container: "border-chart-4/30 bg-chart-4/10 text-foreground dark:bg-chart-4/15",
    icon: "text-chart-4",
    title: "text-chart-4",
    actionDefault: "border border-chart-4/30 bg-chart-4/15 text-foreground hover:bg-chart-4/25",
  },
  destructive: {
    container: "border-destructive/25 bg-destructive/5 text-foreground dark:bg-destructive/10",
    icon: "text-destructive",
    title: "text-destructive",
    actionDefault: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
  neutral: {
    container: "border-border bg-muted/40 text-foreground",
    icon: "text-muted-foreground",
    title: "text-foreground",
    actionDefault: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  },
};

function renderCalloutIcon(icon: CalloutProps["icon"], color: CalloutColor, iconClass: string): React.ReactNode {
  if (icon === false) return null;
  if (React.isValidElement(icon)) return icon;

  const IconComp =
    (icon as React.ComponentType<{ className?: string; "aria-hidden"?: boolean }> | undefined) ?? defaultIcons[color];
  return <IconComp className={cn("size-4 shrink-0", iconClass)} aria-hidden />;
}

interface CalloutActionButtonProps {
  action: CalloutAction;
  defaultVariant: "default" | "outline";
  defaultSize: "default" | "sm" | "xs";
  defaultClass?: string;
  className?: string;
}

function CalloutActionButton({
  action,
  defaultVariant,
  defaultSize,
  defaultClass,
  className,
}: CalloutActionButtonProps) {
  const variant = action.variant ?? defaultVariant;
  const size = action.size ?? defaultSize;
  const isDefaultVariant = variant === "default";

  const safeHref = action.href
    ? sanitizeUrl(action.href, {
        allowMailtoTel: true,
        allowRelative: true,
        allowBareDomain: false,
      })
    : null;

  const showIcon = action.icon !== null && action.icon !== undefined && typeof action.icon !== "boolean";
  const iconNode = showIcon ? (
    <span className="mr-1 inline-flex size-3 shrink-0 items-center justify-center" aria-hidden="true">
      {React.isValidElement(action.icon)
        ? action.icon
        : React.createElement(action.icon as React.ComponentType<{ className?: string }>, {
            className: "size-3",
          })}
    </span>
  ) : null;

  const content = (
    <>
      {iconNode}
      {action.label}
    </>
  );

  return (
    <Button
      type={safeHref ? undefined : "button"}
      size={size}
      variant={variant}
      className={cn(className, isDefaultVariant && defaultClass)}
      asChild={Boolean(safeHref)}
      onClick={action.onClick}
    >
      {safeHref ? (
        <a
          href={safeHref}
          target={action.external ? "_blank" : undefined}
          rel={action.external ? "noreferrer noopener" : undefined}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </Button>
  );
}

export const InfolistCallout = React.forwardRef<HTMLDivElement, CalloutProps>(function InfolistCallout(
  {
    color = "info",
    title,
    description,
    icon,
    compact = false,
    dismissible = false,
    onDismiss,
    actions,
    colSpan,
    className,
    children,
    ...props
  },
  ref,
) {
  const t = useTranslations("infolist");
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  const styles = calloutColorStyles[color] || calloutColorStyles.info;
  const role = color === "destructive" || color === "warning" ? "alert" : "status";

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const iconComponent = renderCalloutIcon(icon, color, styles.icon);
  const showTitle = hasRenderableNode(title);
  const showDescription = hasRenderableNode(description);
  const showChildren = hasRenderableNode(children);

  if (compact) {
    return (
      <div
        ref={ref}
        role={role}
        className={cn(
          "relative flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs transition-colors",
          colSpan ? COL_SPAN_CLASSES[colSpan] : "w-full",
          styles.container,
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {iconComponent}
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {showTitle && <span className={cn("font-semibold", styles.title)}>{title}</span>}
            {showDescription && <span className="text-muted-foreground">{description}</span>}
            {showChildren ? children : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {actions?.map((action, idx) => (
            <CalloutActionButton
              key={idx}
              action={action}
              defaultVariant="outline"
              defaultSize="xs"
              className="text-[11px]"
            />
          ))}

          {dismissible && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label={t("close_alert")}
            >
              <X className="size-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role={role}
      className={cn(
        "relative flex gap-3.5 rounded-xl border p-4 text-sm transition-colors",
        colSpan ? COL_SPAN_CLASSES[colSpan] : "w-full",
        styles.container,
        className,
      )}
      {...props}
    >
      {iconComponent && <div className="mt-0.5 shrink-0">{iconComponent}</div>}

      <div className="min-w-0 flex-1 space-y-1.5">
        {showTitle && (
          <div role="heading" aria-level={4} className={cn("leading-none font-semibold tracking-tight", styles.title)}>
            {title}
          </div>
        )}

        {(showDescription || showChildren) && (
          <div className="text-muted-foreground text-xs leading-relaxed break-words">
            {showDescription ? description : null}
            {showChildren ? children : null}
          </div>
        )}

        {actions && actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {actions.map((action, idx) => (
              <CalloutActionButton
                key={idx}
                action={action}
                defaultVariant="default"
                defaultSize="sm"
                defaultClass={styles.actionDefault}
                className="text-xs"
              />
            ))}
          </div>
        )}
      </div>

      {dismissible && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground absolute top-3 right-3 cursor-pointer"
          aria-label={t("close_alert")}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
});

InfolistCallout.displayName = "InfolistCallout";
