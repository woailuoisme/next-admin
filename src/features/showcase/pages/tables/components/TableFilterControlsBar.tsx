import type { Dispatch, SetStateAction } from "react";

import type { DataTableFilterLayout } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface TableFilterControlsBarProps {
  filterLayout: DataTableFilterLayout;
  setFilterLayout: Dispatch<SetStateAction<DataTableFilterLayout>>;
  columnsCount: 1 | 2 | 3 | 4;
  setColumnsCount: Dispatch<SetStateAction<1 | 2 | 3 | 4>>;
  deferFilters: boolean;
  setDeferFilters: Dispatch<SetStateAction<boolean>>;
  showQueryBuilder: boolean;
  setShowQueryBuilder: Dispatch<SetStateAction<boolean>>;
  showActiveFiltersPills: boolean;
  setShowActiveFiltersPills: Dispatch<SetStateAction<boolean>>;
  paginationVariant: "capsule" | "shadcn" | "simple";
  setPaginationVariant: Dispatch<SetStateAction<"capsule" | "shadcn" | "simple">>;
}

export function TableFilterControlsBar({
  filterLayout,
  setFilterLayout,
  columnsCount,
  setColumnsCount,
  deferFilters,
  setDeferFilters,
  showQueryBuilder,
  setShowQueryBuilder,
  showActiveFiltersPills,
  setShowActiveFiltersPills,
  paginationVariant,
  setPaginationVariant,
}: TableFilterControlsBarProps) {
  return (
    <div className="border-border/60 bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">Filter Layout:</span>
        <div className="border-border/80 bg-muted/30 inline-flex rounded-lg border p-0.5">
          <Button
            variant={filterLayout === "popover" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterLayout("popover")}
            className="h-7 px-2.5 text-xs"
          >
            Popover ({columnsCount} col{columnsCount > 1 ? "s" : ""})
          </Button>
          <Button
            variant={filterLayout === "sheet" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterLayout("sheet")}
            className="h-7 px-2.5 text-xs"
          >
            Slide-over Sheet
          </Button>
          <Button
            variant={filterLayout === "aboveContent" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterLayout("aboveContent")}
            className="h-7 px-2.5 text-xs"
          >
            Above Content
          </Button>
        </div>

        {filterLayout === "popover" && (
          <div className="border-border/80 bg-muted/30 inline-flex rounded-lg border p-0.5">
            {([1, 2, 3] as const).map((cols) => (
              <Button
                key={cols}
                variant={columnsCount === cols ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setColumnsCount(cols)}
                className="h-7 px-2 text-xs"
              >
                {cols}C
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeferFilters(!deferFilters)}
          className="h-8 gap-1.5 text-xs"
        >
          <span>Defer Filters:</span>
          <Badge variant={deferFilters ? "default" : "secondary"} className="text-[10px]">
            {deferFilters ? "ON (Apply btn)" : "OFF (Live)"}
          </Badge>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowQueryBuilder(!showQueryBuilder)}
          className="h-8 gap-1.5 text-xs"
        >
          <span>Query Builder:</span>
          <Badge variant={showQueryBuilder ? "default" : "secondary"} className="text-[10px]">
            {showQueryBuilder ? "Enabled" : "Disabled"}
          </Badge>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowActiveFiltersPills(!showActiveFiltersPills)}
          className="h-8 gap-1.5 text-xs"
        >
          <span>Filter Pills:</span>
          <Badge variant={showActiveFiltersPills ? "default" : "secondary"} className="text-[10px]">
            {showActiveFiltersPills ? "Shown" : "Hidden"}
          </Badge>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setPaginationVariant(
              paginationVariant === "capsule"
                ? "shadcn"
                : paginationVariant === "shadcn"
                  ? "simple"
                  : "capsule",
            )
          }
          className="h-8 gap-1.5 text-xs"
        >
          <span>Pagination:</span>
          <Badge
            variant={
              paginationVariant === "capsule"
                ? "default"
                : paginationVariant === "shadcn"
                  ? "outline"
                  : "secondary"
            }
            className="text-[10px]"
          >
            {paginationVariant === "capsule"
              ? "Capsule v5"
              : paginationVariant === "shadcn"
                ? "Shadcn UI"
                : "Simple"}
          </Badge>
        </Button>
      </div>
    </div>
  );
}
