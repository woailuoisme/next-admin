import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Filter } from "lucide-react";
import { forwardRef, memo, type ReactElement, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "cn";

import type {
  DataTableColDef,
  DataTableFilterDefinition,
  DataTableFilterItem,
  DataTableFilterOperator,
  DataTableSelectFilterOption,
} from "../../core/types";
import type { DataTableFilterPanelProps } from "./types";

import { useFilterInference } from "./hooks/useFilterInference";
import { useFilterPanelState } from "./hooks/useFilterPanelState";
import { isQueryBuilderRule, resolveFilterField } from "./utils";

const LazyQueryBuilderControl = dynamic(
  () => import("./controls/QueryBuilderControl").then((m) => m.QueryBuilderControl),
  { ssr: false },
);

interface FilterTriggerButtonProps extends React.ComponentProps<typeof Button> {
  activeCount?: number;
}

const FilterTriggerButton = forwardRef<HTMLButtonElement, FilterTriggerButtonProps>(
  ({ activeCount = 0, className, ...props }, ref) => {
    const t = useTranslations("table");

    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        className={cn("h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground", className)}
        {...props}
      >
        <Filter className="size-3.5" />
        <span>{t("filter_trigger")}</span>
        {activeCount > 0 ? (
          <Badge
            variant="secondary"
            className="bg-primary/15 text-primary flex size-4.5 items-center justify-center rounded-full p-0 font-mono text-[10px] font-semibold"
          >
            {activeCount}
          </Badge>
        ) : null}
      </Button>
    );
  },
);
FilterTriggerButton.displayName = "FilterTriggerButton";

const POPOVER_WIDTH_CLASSES: Record<number, string> = {
  1: "w-80 sm:w-96",
  2: "w-[90vw] sm:w-[520px] md:w-[580px]",
  3: "w-[90vw] sm:w-[640px] md:w-[760px]",
  4: "w-[95vw] sm:w-[760px] md:w-[900px]",
};

const GRID_COLUMN_CLASSES: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
};

interface FilterSelectOptionItem {
  label: string;
  value: string;
  badge?: string | number;
}

function FilterSelectField({
  value,
  placeholder,
  allLabel,
  options,
  ariaLabel,
  onChange,
}: {
  value: unknown;
  placeholder: string;
  allLabel: string;
  options: FilterSelectOptionItem[];
  ariaLabel: string;
  onChange: (val: string) => void;
}) {
  return (
    <Select value={String(value ?? "__all__")} onValueChange={onChange}>
      <SelectTrigger className="bg-background h-8 text-xs" aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__" className="text-muted-foreground text-xs font-medium">
          {allLabel}
        </SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            <div className="flex w-full items-center justify-between gap-3">
              <span>{opt.label}</span>
              {opt.badge !== undefined ? (
                <span className="bg-muted text-muted-foreground rounded-sm px-1.5 py-0.5 font-mono text-[10px]">
                  {opt.badge}
                </span>
              ) : null}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface FilterRegistryBodyProps<TData = any> {
  resolvedFilters: DataTableFilterDefinition[];
  filterableColumns: DataTableColDef<TData>[];
  currentItems: DataTableFilterItem[];
  activeCount: number;
  columnsCount: number;
  deferFilters: boolean;
  showQueryBuilder: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  onSelectChange: (field: string, val: string) => void;
  onTernaryChange: (field: string, val: string) => void;
  onCustomChange: (field: string, val: any) => void;
  onAddRule: (field: string, operator?: DataTableFilterOperator, value?: any) => void;
  onUpdateRule: (id: string, patch: Partial<DataTableFilterItem>) => void;
  onRemoveRule: (id: string) => void;
  onReset: () => void;
  onClose: () => void;
  onApply: () => void;
}

function FilterRegistryBody<TData = any>({
  resolvedFilters,
  filterableColumns,
  currentItems,
  activeCount,
  columnsCount,
  deferFilters,
  showQueryBuilder,
  hideHeader = false,
  hideFooter = false,
  onSelectChange,
  onTernaryChange,
  onCustomChange,
  onAddRule,
  onUpdateRule,
  onRemoveRule,
  onReset,
  onClose,
  onApply,
}: FilterRegistryBodyProps<TData>) {
  const t = useTranslations("table");
  const showReset = currentItems.length > 0 || activeCount > 0;

  const columnByField = useMemo(() => {
    const map = new Map<string, DataTableColDef<TData>>();
    for (const col of filterableColumns) {
      map.set(col.field, col);
    }
    return map;
  }, [filterableColumns]);

  const { presetItemByField, queryBuilderRules } = useMemo(() => {
    const presetMap = new Map<string, DataTableFilterItem>();
    const qbRules: DataTableFilterItem[] = [];
    for (const item of currentItems) {
      if (isQueryBuilderRule(item)) {
        qbRules.push(item);
      } else if (item.operator === "equals" || !presetMap.has(item.field)) {
        presetMap.set(item.field, item);
      }
    }
    return { presetItemByField: presetMap, queryBuilderRules: qbRules };
  }, [currentItems]);

  return (
    <div data-testid="data-table-filter-panel" className="space-y-4">
      {!hideHeader ? (
        <div className="flex items-center justify-between border-b pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-foreground text-xs font-semibold sm:text-sm">{t("filter_title")}</span>
            {activeCount > 0 ? (
              <Badge variant="secondary" className="bg-primary/10 text-primary font-mono text-[10px]">
                {t("filter_active_count", { count: activeCount })}
              </Badge>
            ) : null}
          </div>

          {showReset ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-6 px-2 text-xs"
            >
              {t("filter_reset")}
            </Button>
          ) : null}
        </div>
      ) : null}

      {resolvedFilters.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-xs">No filters available for this table.</p>
      ) : (
        <div className={cn("grid gap-3.5", GRID_COLUMN_CLASSES[columnsCount] ?? GRID_COLUMN_CLASSES[2])}>
          {resolvedFilters.map((def, idx) => {
            const filterField = resolveFilterField(def, idx);
            const col = columnByField.get(filterField);
            const labelText = def.label ?? col?.headerName ?? filterField;
            const activeItem = presetItemByField.get(filterField);

            if (def.type === "select") {
              const selectOptions: FilterSelectOptionItem[] = def.options.map((opt: DataTableSelectFilterOption) => ({
                label: opt.label,
                value: String(opt.value),
                badge: opt.badge,
              }));
              return (
                <div key={filterField} className="space-y-1.5">
                  <Label className="text-foreground text-xs font-medium">{labelText}</Label>
                  <FilterSelectField
                    value={activeItem?.operator === "equals" ? activeItem.value : undefined}
                    placeholder={def.placeholder ?? "All"}
                    allLabel="- (All)"
                    options={selectOptions}
                    ariaLabel={labelText}
                    onChange={(val) => onSelectChange(filterField, val)}
                  />
                </div>
              );
            }

            if (def.type === "ternary") {
              const ternaryOptions: FilterSelectOptionItem[] = [
                { label: def.trueLabel ?? "Yes", value: "true" },
                { label: def.falseLabel ?? "No", value: "false" },
              ];
              return (
                <div key={filterField} className="space-y-1.5">
                  <Label className="text-foreground text-xs font-medium">{labelText}</Label>
                  <FilterSelectField
                    value={activeItem?.operator === "equals" ? activeItem.value : undefined}
                    placeholder={def.placeholder ?? "-"}
                    allLabel="-"
                    options={ternaryOptions}
                    ariaLabel={labelText}
                    onChange={(val) => onTernaryChange(filterField, val)}
                  />
                </div>
              );
            }

            if (def.type === "custom") {
              return (
                <div key={filterField} className="space-y-1.5">
                  <Label className="text-foreground text-xs font-medium">{labelText}</Label>
                  {def.render({
                    value: activeItem?.value,
                    onChange: (val) => onCustomChange(filterField, val),
                  })}
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {showQueryBuilder ? (
        <LazyQueryBuilderControl
          filterableColumns={filterableColumns}
          rules={queryBuilderRules}
          onAddRule={onAddRule}
          onUpdateRule={onUpdateRule}
          onRemoveRule={onRemoveRule}
        />
      ) : null}

      {!hideFooter ? (
        <div className="flex items-center justify-end gap-2 border-t pt-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            {t("filter_close")}
          </Button>
          <Button type="button" size="sm" onClick={onApply} className="h-8 px-4 text-xs font-medium">
            {deferFilters ? t("filter_apply") : t("filter_done")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * FilterRegistry (Deep Module):
 * Schema-driven control mapper consolidating layout modes (popover / sheet / aboveContent),
 * preset controls (select / ternary / custom), and deferred draft commits behind a single module.
 */
function FilterRegistryInner<TData = any>({
  columns,
  filterModel,
  onFilterModelChange,
  filterConfig,
  filters: directFilters,
  data,
}: DataTableFilterPanelProps<TData>) {
  const t = useTranslations("table");
  const layout = filterConfig?.layout ?? "popover";
  const deferFilters = filterConfig?.deferFilters ?? false;
  const sheetTitle = filterConfig?.sheetTitle ?? t("filter_title");
  const sheetDescription = filterConfig?.sheetDescription ?? "Filter and refine table records.";

  const { filterableColumns, resolvedFilters } = useFilterInference({
    columns,
    filters: directFilters,
    filterConfig,
    data,
  });

  const {
    open,
    setOpen,
    currentItems,
    activeCount,
    handleSelectChange,
    handleTernaryChange,
    handleCustomChange,
    handleAddRule,
    handleUpdateRule,
    handleRemoveRule,
    handleResetAll,
    handleApply,
  } = useFilterPanelState({
    filterModel,
    onFilterModelChange,
    deferFilters,
  });

  const columnsCount = filterConfig?.columns ?? (resolvedFilters.length >= 3 ? 3 : resolvedFilters.length >= 2 ? 2 : 1);
  const showQueryBuilder = Boolean(filterConfig?.showQueryBuilder);

  const sharedBodyProps: FilterRegistryBodyProps<TData> = {
    resolvedFilters,
    filterableColumns,
    currentItems,
    activeCount,
    columnsCount,
    deferFilters,
    showQueryBuilder,
    onSelectChange: handleSelectChange,
    onTernaryChange: handleTernaryChange,
    onCustomChange: handleCustomChange,
    onAddRule: handleAddRule,
    onUpdateRule: handleUpdateRule,
    onRemoveRule: handleRemoveRule,
    onReset: handleResetAll,
    onClose: () => setOpen(false),
    onApply: handleApply,
  };

  if (layout === "aboveContent") {
    return (
      <div className="border-border/60 bg-card rounded-xl border p-4 shadow-xs">
        <FilterRegistryBody {...sharedBodyProps} />
      </div>
    );
  }

  if (layout === "sheet") {
    const showReset = currentItems.length > 0 || activeCount > 0;
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <FilterTriggerButton activeCount={activeCount} />
        </SheetTrigger>
        <SheetContent side="right" className="flex w-full flex-col overflow-y-auto p-6 sm:max-w-md">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between pr-6">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base font-semibold">{sheetTitle}</SheetTitle>
                {activeCount > 0 ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-mono text-[10px]">
                    {t("filter_active_count", { count: activeCount })}
                  </Badge>
                ) : null}
              </div>
              {showReset ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetAll}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-6 px-2 text-xs"
                >
                  {t("filter_reset")}
                </Button>
              ) : null}
            </div>
            <SheetDescription className="text-muted-foreground text-xs">{sheetDescription}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 py-4">
            {open ? <FilterRegistryBody {...sharedBodyProps} hideHeader hideFooter /> : null}
          </div>

          <SheetFooter className="flex flex-row items-center justify-end gap-2 border-t pt-4">
            <SheetClose asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                {t("filter_close")}
              </Button>
            </SheetClose>
            <Button size="sm" onClick={handleApply} className="h-8 px-4 text-xs font-medium">
              {deferFilters ? t("filter_apply") : t("filter_done")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FilterTriggerButton activeCount={activeCount} />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn(
          "border-border/70 p-4 shadow-xl",
          POPOVER_WIDTH_CLASSES[columnsCount] ?? POPOVER_WIDTH_CLASSES[2],
        )}
      >
        {open ? <FilterRegistryBody {...sharedBodyProps} /> : null}
      </PopoverContent>
    </Popover>
  );
}

export const FilterRegistry = memo(FilterRegistryInner) as <TData = any>(
  props: DataTableFilterPanelProps<TData>,
) => ReactElement | null;

export const DataTableFilterPanel = FilterRegistry;
