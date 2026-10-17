import { DataTable, type DataTableColDef, type DataTableFilterLayout } from "@/components/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { getShowcaseRowId, SHOWCASE_FILTERS } from "../constants";
import type { ShowcaseItem } from "../types";

export interface InteractiveTableSectionProps {
  data: ShowcaseItem[];
  columns: DataTableColDef<ShowcaseItem>[];
  filterLayout: DataTableFilterLayout;
  columnsCount: 1 | 2 | 3 | 4;
  deferFilters: boolean;
  showQueryBuilder: boolean;
  showActiveFiltersPills: boolean;
  paginationVariant: "capsule" | "shadcn" | "simple";
}

export function InteractiveTableSection({
  data,
  columns,
  filterLayout,
  columnsCount,
  deferFilters,
  showQueryBuilder,
  showActiveFiltersPills,
  paginationVariant,
}: InteractiveTableSectionProps) {
  return (
    <Card className="border-border/60 max-w-full min-w-0 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Interactive DataTable with Filament v5 Features
        </CardTitle>
        <CardDescription className="text-xs">
          Try toggling the filter drawer or above-content inline panel, applying ternary filters, assembling
          dynamic rules in Query Builder, and navigating through pages with capsule pagination.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-w-full min-w-0 overflow-hidden p-0">
        <div className="w-full max-w-full min-w-0 overflow-hidden">
          <DataTable
            rows={data}
            columns={columns}
            loading={false}
            getRowId={getShowcaseRowId}
            paginationMode="client"
            paginationVariant={paginationVariant}
            filterConfig={{
              layout: filterLayout,
              columns: columnsCount,
              deferFilters,
              showQueryBuilder,
              showActiveFiltersPills,
              sheetTitle: "Filter Showcase Items",
              sheetDescription: "Filter records using Filament v5 multi-layout architecture.",
            }}
            filters={SHOWCASE_FILTERS}
          />
        </div>
      </CardContent>
    </Card>
  );
}
