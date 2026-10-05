import { ChevronDown } from "lucide-react";
import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import type { InfolistSectionProps } from "./types";

import { InfolistGrid } from "./InfolistGrid";

export const InfolistSection = React.memo(function InfolistSection({
  title,
  description,
  icon,
  action,
  collapsible = false,
  defaultCollapsed = false,
  columns,
  card = true,
  footer,
  className,
  children,
  ...props
}: InfolistSectionProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  const hasHeader = Boolean(title || description || icon || action);

  const contentNode = (
    <div className="w-full">
      {columns ? <InfolistGrid columns={columns}>{children}</InfolistGrid> : children}
    </div>
  );

  if (card) {
    return (
      <Collapsible
        open={!collapsed}
        onOpenChange={(open) => setCollapsed(!open)}
        className="w-full"
      >
        <Card
          className={cn(
            "w-full border-border bg-card text-left shadow-2xs transition-all duration-200",
            className,
          )}
          {...props}
        >
          {hasHeader && (
            <CardHeader
              className={cn(
                "flex items-start justify-between gap-3 border-b border-border/50 pb-3.5",
                collapsible && "select-none",
              )}
            >
              <div className="flex min-w-0 flex-1 items-start gap-2.5">
                {icon && (
                  <div className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                    {icon}
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-0.5">
                  {title && (
                    <CardTitle className="text-foreground flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                      {title}
                    </CardTitle>
                  )}
                  {description && (
                    <CardDescription className="text-muted-foreground text-xs leading-relaxed">
                      {description}
                    </CardDescription>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {action && <div className="text-xs">{action}</div>}
                {collapsible && (
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 cursor-pointer items-center justify-center rounded-md border transition-all"
                      aria-label={collapsed ? "展开区块" : "收起区块"}
                    >
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200",
                          collapsed ? "-rotate-90" : "rotate-0",
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                )}
              </div>
            </CardHeader>
          )}

          <CollapsibleContent className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-150">
            <CardContent className="pt-4">{contentNode}</CardContent>
            {footer && (
              <CardFooter className="border-border/40 text-muted-foreground border-t pt-3 text-xs">
                {footer}
              </CardFooter>
            )}
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  return (
    <div className={cn("w-full space-y-3", className)} {...props}>
      {hasHeader && (
        <div className="border-border/60 flex items-center justify-between gap-3 border-b pb-2">
          <div className="flex items-center gap-2">
            {icon && <div className="text-primary">{icon}</div>}
            <div>
              {title && <h4 className="text-foreground text-sm font-semibold">{title}</h4>}
              {description && <p className="text-muted-foreground text-xs">{description}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {contentNode}
      {footer && <div className="text-muted-foreground pt-2 text-xs">{footer}</div>}
    </div>
  );
});
