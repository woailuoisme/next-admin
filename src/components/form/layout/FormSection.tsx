import { useMemoizedFn } from "ahooks";
import { ChevronDown } from "lucide-react";
import { memo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import type { GridColumns } from "../core";

import { FormGrid } from "./FormGrid";

export interface FormSectionProps {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  columns?: GridColumns;
  card?: boolean;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const FormSection = memo(function FormSection({
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
}: FormSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const handleOpenChange = useMemoizedFn((open: boolean) => {
    setCollapsed(!open);
  });

  const hasHeader = Boolean(title || description || icon || action);

  const contentNode = (
    <div className="w-full">{columns ? <FormGrid columns={columns}>{children}</FormGrid> : children}</div>
  );

  if (card) {
    return (
      <Collapsible open={!collapsed} onOpenChange={handleOpenChange} className="w-full">
        <Card
          className={cn(
            "w-full border-border/70 bg-card/60 text-left shadow-2xs backdrop-blur-xs transition-all duration-200",
            className,
          )}
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

              <CardAction className="flex shrink-0 items-center gap-2">
                {action}
                {collapsible && (
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground size-7 rounded-md"
                      aria-label={collapsed ? "展开区块" : "折叠区块"}
                    >
                      <ChevronDown
                        className={cn("size-4 transition-transform duration-200", collapsed && "-rotate-90")}
                      />
                    </Button>
                  </CollapsibleTrigger>
                )}
              </CardAction>
            </CardHeader>
          )}

          <CollapsibleContent>
            <CardContent className={cn(hasHeader ? "pt-4" : "p-4")}>{contentNode}</CardContent>
          </CollapsibleContent>

          {footer && !collapsed && (
            <CardFooter className="border-border/50 flex items-center justify-end gap-2 border-t pt-3">
              {footer}
            </CardFooter>
          )}
        </Card>
      </Collapsible>
    );
  }

  return (
    <Collapsible
      open={!collapsed}
      onOpenChange={handleOpenChange}
      className={cn("w-full space-y-4 text-left", className)}
    >
      {hasHeader && (
        <div className="border-border/40 flex items-start justify-between gap-3 border-b pb-2">
          <div className="flex items-start gap-2.5">
            {icon && (
              <div className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                {icon}
              </div>
            )}
            <div className="space-y-0.5">
              {title && (
                <h3 className="text-foreground flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                  {title}
                </h3>
              )}
              {description && <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {action}
            {collapsible && (
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground size-7 rounded-md"
                  aria-label={collapsed ? "展开区块" : "折叠区块"}
                >
                  <ChevronDown
                    className={cn("size-4 transition-transform duration-200", collapsed && "-rotate-90")}
                  />
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
        </div>
      )}

      <CollapsibleContent>{contentNode}</CollapsibleContent>

      {footer && !collapsed && (
        <div className="border-border/50 mt-4 flex items-center justify-end gap-2 border-t pt-3">
          {footer}
        </div>
      )}
    </Collapsible>
  );
});
