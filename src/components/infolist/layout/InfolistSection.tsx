"use client";

import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import * as React from "react";

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
import { cn } from "cn";

import type { InfolistSectionProps } from "./types";

import { hasRenderableNode } from "../core/utils";
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
  const t = useTranslations("infolist");
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  const handleOpenChange = React.useCallback((open: boolean) => {
    setCollapsed(!open);
  }, []);

  const showTitle = hasRenderableNode(title);
  const showDescription = hasRenderableNode(description);
  const showIcon = hasRenderableNode(icon);
  const showAction = hasRenderableNode(action);
  const showFooter = hasRenderableNode(footer);

  const hasHeader = showTitle || showDescription || showIcon || showAction;
  const showHeaderArea = hasHeader || collapsible;

  const contentNode = (
    <div className="w-full">{columns ? <InfolistGrid columns={columns}>{children}</InfolistGrid> : children}</div>
  );

  const collapseBaseLabel = collapsed ? t("section_expand") : t("section_collapse");
  const collapseAriaLabel =
    typeof title === "string" && title.trim() ? `${collapseBaseLabel}: ${title.trim()}` : collapseBaseLabel;

  const collapseTrigger = collapsible ? (
    <CollapsibleTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground size-7 rounded-md"
        aria-label={collapseAriaLabel}
        aria-expanded={!collapsed}
      >
        <ChevronDown
          className={cn("size-4 transition-transform duration-200", collapsed && "-rotate-90")}
          aria-hidden="true"
        />
      </Button>
    </CollapsibleTrigger>
  ) : null;

  if (card) {
    const cardHeader = showHeaderArea ? (
      <CardHeader
        className={cn(
          "flex items-start justify-between gap-3 border-b border-border/50 pb-3.5",
          collapsible && "select-none",
        )}
      >
        {hasHeader ? (
          <div className="flex min-w-0 flex-1 items-start gap-2.5">
            {showIcon && (
              <div
                aria-hidden="true"
                className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
              >
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-0.5">
              {showTitle && (
                <CardTitle className="text-foreground flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                  {title}
                </CardTitle>
              )}
              {showDescription && (
                <CardDescription className="text-muted-foreground text-xs leading-relaxed">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {(showAction || collapseTrigger) && (
          <CardAction className="flex shrink-0 items-center gap-2">
            {showAction && <div className="text-xs">{action}</div>}
            {collapseTrigger}
          </CardAction>
        )}
      </CardHeader>
    ) : null;

    const cardBody = (
      <>
        <CardContent className={cn(showHeaderArea ? "pt-4" : "pt-0")}>{contentNode}</CardContent>
        {showFooter && (
          <CardFooter className="border-border/40 text-muted-foreground border-t pt-3 text-xs">{footer}</CardFooter>
        )}
      </>
    );

    if (!collapsible) {
      return (
        <Card className={cn("w-full bg-card text-left shadow-2xs transition-all duration-200", className)} {...props}>
          {cardHeader}
          {cardBody}
        </Card>
      );
    }

    return (
      <Collapsible open={!collapsed} onOpenChange={handleOpenChange} className="w-full">
        <Card className={cn("w-full bg-card text-left shadow-2xs transition-all duration-200", className)} {...props}>
          {cardHeader}
          <CollapsibleContent className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-150">
            {cardBody}
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  const plainHeader = showHeaderArea ? (
    <div className="border-border/60 flex items-center justify-between gap-3 border-b pb-2">
      {hasHeader ? (
        <div className="flex items-center gap-2">
          {showIcon && (
            <div aria-hidden="true" className="text-primary">
              {icon}
            </div>
          )}
          <div>
            {showTitle && <h4 className="text-foreground text-sm font-semibold">{title}</h4>}
            {showDescription && <p className="text-muted-foreground text-xs">{description}</p>}
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}
      {(showAction || collapseTrigger) && (
        <div className="flex shrink-0 items-center gap-2">
          {showAction ? action : null}
          {collapseTrigger}
        </div>
      )}
    </div>
  ) : null;

  if (collapsible) {
    return (
      <Collapsible
        open={!collapsed}
        onOpenChange={handleOpenChange}
        className={cn("w-full space-y-3", className)}
        {...props}
      >
        {plainHeader}
        <CollapsibleContent className="space-y-2">
          {contentNode}
          {showFooter && <div className="text-muted-foreground pt-2 text-xs">{footer}</div>}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className={cn("w-full space-y-3", className)} {...props}>
      {plainHeader}
      {contentNode}
      {showFooter && <div className="text-muted-foreground pt-2 text-xs">{footer}</div>}
    </div>
  );
});
