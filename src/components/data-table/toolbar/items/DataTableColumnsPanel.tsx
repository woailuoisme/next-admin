import { useBoolean, useMemoizedFn } from "ahooks";
import { Columns3 } from "lucide-react";
import { memo, useMemo, useState, type ReactElement } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import type { DataTableColDef } from "../../core/types";
import type { DataTableColumnsPanelProps } from "../types";

export type { DataTableColumnsPanelProps };

function DataTableColumnsPanelInner<TData = any>({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
}: DataTableColumnsPanelProps<TData>) {
  const [open, { set: setOpen }] = useBoolean(false);
  const [search, setSearch] = useState("");

  const toggleableColumns = useMemo(() => {
    return columns.filter(
      (col: DataTableColDef<TData>) =>
        col.field !== "__checkbox__" &&
        col.field !== "__actions__" &&
        col.field !== "__actions" &&
        col.field !== "actions",
    );
  }, [columns]);

  const filteredColumns = useMemo(() => {
    if (!search.trim()) return toggleableColumns;
    const s = search.toLowerCase();
    return toggleableColumns.filter((col: DataTableColDef<TData>) =>
      col.headerName.toLowerCase().includes(s),
    );
  }, [toggleableColumns, search]);

  const handleToggle = useMemoizedFn((field: string, checked: boolean) => {
    onColumnVisibilityChange({
      ...columnVisibility,
      [field]: checked,
    });
  });

  const handleShowAll = useMemoizedFn(() => {
    const next: Record<string, boolean> = {};
    for (const col of toggleableColumns) {
      next[col.field] = true;
    }
    onColumnVisibilityChange(next);
  });

  const handleHideAll = useMemoizedFn(() => {
    const next: Record<string, boolean> = {};
    for (const col of toggleableColumns) {
      next[col.field] = false;
    }
    onColumnVisibilityChange(next);
  });

  const visibleCount = useMemo(() => {
    return toggleableColumns.filter(
      (col: DataTableColDef<TData>) => columnVisibility[col.field] !== false,
    ).length;
  }, [toggleableColumns, columnVisibility]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs"
        >
          <Columns3 className="size-3.5" />
          <span>Columns</span>
          <span className="py-0.2 bg-muted rounded-full px-1.5 font-mono text-[10px]">
            {visibleCount}/{toggleableColumns.length}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3 shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-foreground text-xs font-semibold">Manage Columns</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-6 px-1.5 text-[11px]"
                onClick={handleShowAll}
              >
                Show all
              </Button>
              <span className="text-muted-foreground/40">|</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-6 px-1.5 text-[11px]"
                onClick={handleHideAll}
              >
                Hide all
              </Button>
            </div>
          </div>

          {toggleableColumns.length > 6 && (
            <input
              type="text"
              placeholder="Search columns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-input focus:ring-ring h-7 w-full rounded-md border bg-transparent px-2 text-xs focus:ring-1 focus:outline-hidden"
            />
          )}

          <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
            {filteredColumns.map((col: DataTableColDef<TData>, idx: number) => {
              const isVisible = columnVisibility[col.field] !== false;
              return (
                <label
                  key={col.id ?? `${col.field}_${idx}`}
                  className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-md p-1.5 text-xs transition-colors"
                >
                  <span className="text-foreground truncate">{col.headerName}</span>
                  <Checkbox
                    checked={isVisible}
                    onCheckedChange={(val) => handleToggle(col.field, Boolean(val))}
                  />
                </label>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const DataTableColumnsPanel = memo(DataTableColumnsPanelInner) as <TData = any>(
  props: DataTableColumnsPanelProps<TData>,
) => ReactElement | null;
