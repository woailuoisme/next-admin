import { AlertOctagon, AlertTriangle, CheckCircle2, HelpCircle, Info, Sparkles, X } from "lucide-react";
import * as React from "react";

import { COL_SPAN_CLASSES } from "@/components/shared/grid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { CalloutAction, CalloutColor, CalloutProps } from "./types";

const defaultIcons: Record<CalloutColor, React.ComponentType<{ className?: string }>> = {
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
    container: "border-sky-500/25 bg-sky-500/5 text-foreground dark:bg-sky-500/10",
    icon: "text-sky-600 dark:text-sky-400",
    title: "text-sky-700 dark:text-sky-300",
    actionDefault: "bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500",
  },
  success: {
    container: "border-emerald-500/25 bg-emerald-500/5 text-foreground dark:bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-400",
    title: "text-emerald-700 dark:text-emerald-300",
    actionDefault: "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500",
  },
  warning: {
    container: "border-amber-500/25 bg-amber-500/5 text-foreground dark:bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-400",
    title: "text-amber-700 dark:text-amber-300",
    actionDefault: "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500",
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

function renderCalloutIcon(
  icon: CalloutProps["icon"],
  color: CalloutColor,
  iconClass: string,
): React.ReactNode {
  if (icon === false) return null;
  if (React.isValidElement(icon)) return icon;

  const IconComp = (icon as React.ComponentType<{ className?: string }> | undefined) ?? defaultIcons[color];
  return <IconComp className={cn("size-4 shrink-0", iconClass)} />;
}

interface CalloutActionButtonProps {
  action: CalloutAction;
  defaultVariant: "default" | "outline";
  defaultClass?: string;
  className?: string;
}

function CalloutActionButton({ action, defaultVariant, defaultClass, className }: CalloutActionButtonProps) {
  const variant = action.variant ?? defaultVariant;
  const isDefaultVariant = variant === "default";

  const iconNode = action.icon && (
    <span className="mr-1 inline-flex size-3 shrink-0 items-center justify-center">
      {React.isValidElement(action.icon)
        ? action.icon
        : React.createElement(action.icon as React.ComponentType<{ className?: string }>, {
            className: "size-3",
          })}
    </span>
  );

  const content = (
    <>
      {iconNode}
      {action.label}
    </>
  );

  return (
    <Button
      size="sm"
      variant={variant}
      className={cn(className, isDefaultVariant && defaultClass)}
      asChild={Boolean(action.href)}
      onClick={action.onClick}
    >
      {action.href ? (
        <a
          href={action.href}
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
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  const styles = calloutColorStyles[color] || calloutColorStyles.info;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const iconComponent = renderCalloutIcon(icon, color, styles.icon);

  if (compact) {
    return (
      <div
        ref={ref}
        role="status"
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
            {title && <span className={cn("font-semibold", styles.title)}>{title}</span>}
            {description && <span className="text-muted-foreground">{description}</span>}
            {children}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {actions?.map((action, idx) => (
            <CalloutActionButton
              key={idx}
              action={action}
              defaultVariant="outline"
              className="h-6 px-2 text-[11px]"
            />
          ))}

          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground cursor-pointer rounded-sm p-0.5 transition-colors"
              aria-label="关闭提示"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="status"
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
        {title && <h5 className={cn("leading-none font-semibold tracking-tight", styles.title)}>{title}</h5>}

        {(description || children) && (
          <div className="text-muted-foreground text-xs leading-relaxed break-words">
            {description}
            {children}
          </div>
        )}

        {actions && actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {actions.map((action, idx) => (
              <CalloutActionButton
                key={idx}
                action={action}
                defaultVariant="default"
                defaultClass={styles.actionDefault}
                className="h-7 text-xs"
              />
            ))}
          </div>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground absolute top-3.5 right-3.5 cursor-pointer rounded-sm p-1 transition-colors"
          aria-label="关闭提示"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
});

InfolistCallout.displayName = "InfolistCallout";
