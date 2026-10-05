import { ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";

import { TableEmptyState } from "@/components/data-table";
import { cn } from "@/lib/utils";

import type { RepeatableEntryProps } from "./types";

import { EntryWrapper } from "../core/EntryWrapper";
import { useInfolistFieldValue } from "../core/InfolistContext";

const gridColClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

const tableGridColClasses = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

interface RepeatableCardItemProps {
  title?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}

function RepeatableCardItem({
  title,
  collapsible = false,
  defaultCollapsed = false,
  children,
}: RepeatableCardItemProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-2xs transition-all">
      {title && (
        <div
          onClick={() => collapsible && setCollapsed((prev) => !prev)}
          className={cn(
            "flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5 text-xs font-semibold select-none",
            collapsible ? "cursor-pointer transition-colors hover:bg-muted/60" : "",
          )}
        >
          <span className="text-foreground">{title}</span>
          {collapsible && (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground rounded-sm p-0.5"
              aria-label={collapsed ? "展开" : "收起"}
            >
              {collapsed ? (
                <ChevronRight className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
          )}
        </div>
      )}
      {!collapsed && <div className="p-4">{children}</div>}
    </div>
  );
}

export function RepeatableEntry<T = any>({
  name,
  value: explicitValue,
  variant = "card",
  gridCols = 2,
  itemTitle,
  itemTitleWidth,
  tableHeaders,
  collapsible = false,
  defaultCollapsed = false,
  emptyHeading = "暂无数据",
  emptyDescription = "列表中没有任何条目记录",
  children,
  ...wrapperProps
}: RepeatableEntryProps<T>) {
  const rawValue = useInfolistFieldValue<T[]>(name, explicitValue ?? undefined);

  const items = React.useMemo(() => {
    if (Array.isArray(rawValue)) return rawValue;
    return [];
  }, [rawValue]);

  const renderContent = () => {
    if (items.length === 0) {
      return (
        <TableEmptyState
          size="sm"
          heading={emptyHeading}
          description={emptyDescription}
          className="bg-muted/10 rounded-xl border border-dashed py-6"
        />
      );
    }

    if (variant === "table") {
      const resolvedTitleWidth = itemTitleWidth ?? "w-64 sm:w-80";

      return (
        <div className="border-border bg-card overflow-x-auto rounded-xl border">
          <div className="min-w-[540px]">
            {tableHeaders && tableHeaders.length > 0 && (
              <div className="border-border bg-muted/50 text-muted-foreground flex items-center gap-4 border-b px-3 py-2 text-xs font-semibold select-none">
                {itemTitle && (
                  <div className={cn("shrink-0", resolvedTitleWidth)}>{tableHeaders[0]}</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className={cn("grid gap-2", tableGridColClasses[gridCols] ?? "grid-cols-3")}>
                    {tableHeaders.slice(itemTitle ? 1 : 0).map((header, hIdx) => (
                      <div key={hIdx}>{header}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="divide-border/60 divide-y">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="hover:bg-muted/30 flex items-center gap-4 p-3 text-xs transition-colors"
                >
                  {itemTitle && (
                    <div
                      className={cn(
                        "shrink-0 truncate font-medium text-foreground select-none",
                        resolvedTitleWidth,
                      )}
                      title={
                        typeof itemTitle(item, idx) === "string"
                          ? String(itemTitle(item, idx))
                          : undefined
                      }
                    >
                      {itemTitle(item, idx)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">{children(item, idx)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          variant === "grid"
            ? cn("grid gap-3", gridColClasses[gridCols] ?? gridColClasses[2])
            : "flex flex-col gap-3",
        )}
      >
        {items.map((item, idx) => (
          <RepeatableCardItem
            key={idx}
            title={itemTitle ? itemTitle(item, idx) : `条目 #${idx + 1}`}
            collapsible={collapsible}
            defaultCollapsed={defaultCollapsed}
          >
            {children(item, idx)}
          </RepeatableCardItem>
        ))}
      </div>
    );
  };

  return <EntryWrapper {...wrapperProps}>{renderContent()}</EntryWrapper>;
}
