"use client";

import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";

import { TableEmptyState } from "@/components/data-table/empty-state";
import { resolveFixedColsClassName, resolveGridClassName } from "@/components/shared/grid";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "cn";

import type { RepeatableEntryProps } from "./types";

import { EntryWrapper } from "../core/EntryWrapper";
import { useInfolistFieldValue } from "../core/InfolistContext";
import { hasRenderableNode } from "../core/utils";

const EMPTY_ITEMS: unknown[] = [];

function resolveItemKey<T>(item: T, idx: number, keyExtractor?: (item: T, idx: number) => React.Key): React.Key {
  if (keyExtractor) return keyExtractor(item, idx);
  if (item && typeof item === "object") {
    const rec = item as Record<string, unknown>;
    if (rec.id != null) return String(rec.id);
    if (rec._id != null) return String(rec._id);
    if (rec.key != null) return String(rec.key);
  }
  return idx;
}

interface RepeatableCardItemProps {
  title: React.ReactNode;
  collapsible: boolean;
  defaultCollapsed: boolean;
  expandLabel: string;
  collapseLabel: string;
  children: React.ReactNode;
}

const RepeatableCardItem = React.memo(function RepeatableCardItem({
  title,
  collapsible,
  defaultCollapsed,
  expandLabel,
  collapseLabel,
  children,
}: RepeatableCardItemProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  const handleOpenChange = React.useCallback((open: boolean) => {
    setCollapsed(!open);
  }, []);

  if (!collapsible) {
    return (
      <div className="border-border bg-card overflow-hidden rounded-xl border shadow-2xs transition-all">
        {hasRenderableNode(title) && (
          <div className="border-border/60 bg-muted/40 flex items-center justify-between border-b px-4 py-2.5 text-xs font-semibold select-none">
            <span className="text-foreground">{title}</span>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    );
  }

  return (
    <Collapsible
      open={!collapsed}
      onOpenChange={handleOpenChange}
      className="border-border bg-card overflow-hidden rounded-xl border shadow-2xs transition-all"
    >
      <div className="border-border/60 bg-muted/40 border-b px-2 py-1">
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={!collapsed}
            className="text-foreground hover:bg-muted/60 flex h-auto w-full items-center justify-between px-2 py-1.5 text-xs font-semibold"
          >
            <span className="truncate text-left">{title}</span>
            <span className="sr-only"> {collapsed ? expandLabel : collapseLabel}</span>
            {collapsed ? (
              <ChevronRight className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronDown className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="p-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
});

function RepeatableEntryInner<T = any>({
  name,
  value: explicitValue,
  variant = "card",
  gridCols = 2,
  itemTitle,
  itemTitleWidth,
  tableHeaders,
  collapsible = false,
  defaultCollapsed = false,
  emptyHeading,
  emptyDescription,
  keyExtractor,
  children,
  ...wrapperProps
}: RepeatableEntryProps<T>) {
  const t = useTranslations("infolist");
  const rawValue = useInfolistFieldValue<T[]>(name, explicitValue ?? undefined);

  const items = Array.isArray(rawValue) ? rawValue : (EMPTY_ITEMS as T[]);

  const resolvedEmptyHeading = emptyHeading ?? t("empty_text");
  const resolvedEmptyDescription = emptyDescription ?? t("empty_desc");

  const renderContent = () => {
    if (items.length === 0) {
      return (
        <TableEmptyState
          size="sm"
          heading={resolvedEmptyHeading}
          description={resolvedEmptyDescription}
          className="bg-muted/10 rounded-xl border border-dashed py-6"
        />
      );
    }

    if (variant === "table") {
      const resolvedTitleWidth = itemTitleWidth ?? "w-64 sm:w-80";
      const remainingHeaders = tableHeaders ? tableHeaders.slice(itemTitle ? 1 : 0) : [];
      const hasRemainingHeaders = remainingHeaders.length > 0;
      const headerColsClass = hasRemainingHeaders ? resolveFixedColsClassName(remainingHeaders.length) : undefined;

      return (
        <div className="border-border bg-card overflow-hidden rounded-xl border">
          <Table className="min-w-[540px] text-xs">
            {tableHeaders && tableHeaders.length > 0 && (
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  {itemTitle && (
                    <TableHead
                      scope="col"
                      className={cn("h-9 px-3 text-xs font-semibold select-none", resolvedTitleWidth)}
                    >
                      {tableHeaders[0]}
                    </TableHead>
                  )}
                  <TableHead scope="col" className="h-9 px-3 text-xs font-semibold select-none">
                    {hasRemainingHeaders ? (
                      <div className={cn("grid gap-2", headerColsClass)}>
                        {remainingHeaders.map((header, hIdx) => (
                          <div key={hIdx}>{header}</div>
                        ))}
                      </div>
                    ) : null}
                  </TableHead>
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              {items.map((item, idx) => {
                const key = resolveItemKey(item, idx, keyExtractor);
                const resolvedTitle = itemTitle ? itemTitle(item, idx) : undefined;
                return (
                  <TableRow key={key}>
                    {itemTitle && (
                      <TableCell
                        className={cn(
                          "text-foreground p-3 font-medium whitespace-normal select-none",
                          resolvedTitleWidth,
                        )}
                        title={typeof resolvedTitle === "string" ? resolvedTitle : undefined}
                      >
                        <div className="truncate">{resolvedTitle}</div>
                      </TableCell>
                    )}
                    <TableCell className="p-3 whitespace-normal">{children(item, idx)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      );
    }

    return (
      <div className={variant === "grid" ? resolveGridClassName(gridCols, "sm") : "flex flex-col gap-3"}>
        {items.map((item, idx) => {
          const key = resolveItemKey(item, idx, keyExtractor);
          const resolvedTitle = itemTitle ? itemTitle(item, idx) : t("item_title", { index: String(idx + 1) });
          return (
            <RepeatableCardItem
              key={key}
              title={resolvedTitle}
              collapsible={collapsible}
              defaultCollapsed={defaultCollapsed}
              expandLabel={t("expand")}
              collapseLabel={t("collapse")}
            >
              {children(item, idx)}
            </RepeatableCardItem>
          );
        })}
      </div>
    );
  };

  return <EntryWrapper {...wrapperProps}>{renderContent()}</EntryWrapper>;
}

export const RepeatableEntry = React.memo(RepeatableEntryInner) as <T = any>(
  props: RepeatableEntryProps<T>,
) => React.ReactElement;
