"use client";

import { useMemo, useState } from "react";
import { useMemoizedFn } from "ahooks";
import { toast } from "sonner";

import type { DataTableFilterLayout } from "@/components/data-table";

import { createShowcaseColumns } from "./columns";
import { EmptyStateShowcaseSection } from "./components/EmptyStateShowcaseSection";
import { InteractiveTableSection } from "./components/InteractiveTableSection";
import { MasterDetailTableSection } from "./components/MasterDetailTableSection";
import { TableFilterControlsBar } from "./components/TableFilterControlsBar";
import { INITIAL_DATA } from "./constants";
import type { ShowcaseItem } from "./types";

export function TableShowcasePage() {
  const [data, setData] = useState<ShowcaseItem[]>(INITIAL_DATA);
  const [filterLayout, setFilterLayout] = useState<DataTableFilterLayout>("popover");
  const [deferFilters, setDeferFilters] = useState<boolean>(true);
  const [showQueryBuilder, setShowQueryBuilder] = useState<boolean>(true);
  const [showActiveFiltersPills, setShowActiveFiltersPills] = useState<boolean>(true);
  const [columnsCount, setColumnsCount] = useState<1 | 2 | 3 | 4>(2);
  const [paginationVariant, setPaginationVariant] = useState<"capsule" | "shadcn" | "simple">("capsule");

  const updateItem = useMemoizedFn((id: string, patch: Partial<ShowcaseItem>) => {
    setData((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  });

  const removeItem = useMemoizedFn((id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    toast.error(`Deleted ${id}`);
  });

  const isAllSelected = useMemo(() => data.length > 0 && data.every((item) => item.isSelected), [data]);
  const isSomeSelected = useMemo(
    () => data.some((item) => item.isSelected) && !isAllSelected,
    [data, isAllSelected],
  );

  const columns = useMemo(
    () =>
      createShowcaseColumns({
        isAllSelected,
        isSomeSelected,
        updateItem,
        removeItem,
        setData,
      }),
    [isAllSelected, isSomeSelected, updateItem, removeItem],
  );

  return (
    <div className="max-w-full min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Filament v5 Table Columns Showcase</h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Live gallery demonstrating 15 table column types alongside Filament v5 Capsule segmented pagination
          and multi-layout Filter systems (Popover, Slide-over Sheet, Above Content, Deferred filters).
        </p>
      </div>

      <TableFilterControlsBar
        filterLayout={filterLayout}
        setFilterLayout={setFilterLayout}
        columnsCount={columnsCount}
        setColumnsCount={setColumnsCount}
        deferFilters={deferFilters}
        setDeferFilters={setDeferFilters}
        showQueryBuilder={showQueryBuilder}
        setShowQueryBuilder={setShowQueryBuilder}
        showActiveFiltersPills={showActiveFiltersPills}
        setShowActiveFiltersPills={setShowActiveFiltersPills}
        paginationVariant={paginationVariant}
        setPaginationVariant={setPaginationVariant}
      />

      <InteractiveTableSection
        data={data}
        columns={columns}
        filterLayout={filterLayout}
        columnsCount={columnsCount}
        deferFilters={deferFilters}
        showQueryBuilder={showQueryBuilder}
        showActiveFiltersPills={showActiveFiltersPills}
        paginationVariant={paginationVariant}
      />

      <MasterDetailTableSection data={data} />

      <EmptyStateShowcaseSection columns={columns} />
    </div>
  );
}
