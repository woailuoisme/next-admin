import { useTranslations } from "next-intl";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type {
  DataTableColDef,
  DataTableFilterDefinition,
  DataTableFilterItem,
  DataTableFilterOperator,
} from "../../../core/types";

import { FilterControlGrid } from "../controls/FilterControlGrid";
import { QueryBuilderControl } from "../controls/QueryBuilderControl";

export interface FilterPanelHeaderProps {
  title?: string;
  activeCount: number;
  showReset: boolean;
  onReset: () => void;
}

export const FilterPanelHeader: React.FC<FilterPanelHeaderProps> = ({ title, activeCount, showReset, onReset }) => {
  const t = useTranslations("table");
  const displayTitle = title ?? t("filter_title");

  return (
    <div className="flex items-center justify-between border-b pb-2.5">
      <div className="flex items-center gap-2">
        <span className="text-foreground text-xs font-semibold sm:text-sm">{displayTitle}</span>
        {activeCount > 0 && (
          <Badge variant="secondary" className="bg-primary/10 text-primary font-mono text-[10px]">
            {t("filter_active_count", { count: activeCount })}
          </Badge>
        )}
      </div>

      {showReset && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-6 px-2 text-xs"
        >
          {t("filter_reset")}
        </Button>
      )}
    </div>
  );
};

export interface FilterPanelFooterProps {
  deferFilters?: boolean;
  onClose: () => void;
  onApply: () => void;
}

export const FilterPanelFooter: React.FC<FilterPanelFooterProps> = ({ deferFilters = false, onClose, onApply }) => {
  const t = useTranslations("table");

  return (
    <div className="flex items-center justify-end gap-2 border-t pt-3">
      <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
        {t("filter_close")}
      </Button>
      <Button type="button" size="sm" onClick={onApply} className="h-8 px-4 text-xs font-medium">
        {deferFilters ? t("filter_apply") : t("filter_done")}
      </Button>
    </div>
  );
};

export interface FilterPanelBodyProps<TData = any> {
  resolvedFilters: DataTableFilterDefinition[];
  filterableColumns: DataTableColDef<TData>[];
  currentItems: DataTableFilterItem[];
  activeCount: number;
  columnsCount?: number;
  deferFilters?: boolean;
  showQueryBuilder?: boolean;
  title?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;

  onSelectChange: (field: string, val: string) => void;
  onTernaryChange: (field: string, val: string) => void;
  onCustomChange: (field: string, val: any) => void;
  onAddRule?: (field: string, operator?: DataTableFilterOperator, value?: any) => void;
  onUpdateRule?: (id: string, patch: Partial<DataTableFilterItem>) => void;
  onRemoveRule?: (id: string) => void;
  onReset: () => void;
  onClose: () => void;
  onApply: () => void;
}

export const FilterPanelBody: React.FC<FilterPanelBodyProps> = ({
  resolvedFilters,
  filterableColumns,
  currentItems,
  activeCount,
  columnsCount,
  deferFilters = false,
  showQueryBuilder = false,
  title,
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
}) => {
  const showReset = currentItems.length > 0 || activeCount > 0;
  const queryBuilderRules = React.useMemo(
    () => currentItems.filter((item) => item.id?.startsWith("qb_")),
    [currentItems],
  );

  return (
    <div data-testid="data-table-filter-panel" className="space-y-4">
      {!hideHeader && (
        <FilterPanelHeader title={title} activeCount={activeCount} showReset={showReset} onReset={onReset} />
      )}

      <FilterControlGrid
        resolvedFilters={resolvedFilters}
        filterableColumns={filterableColumns}
        currentItems={currentItems}
        columnsCount={columnsCount}
        onSelectChange={onSelectChange}
        onTernaryChange={onTernaryChange}
        onCustomChange={onCustomChange}
      />

      {showQueryBuilder && onAddRule && onUpdateRule && onRemoveRule && (
        <QueryBuilderControl
          filterableColumns={filterableColumns}
          rules={queryBuilderRules}
          onAddRule={onAddRule}
          onUpdateRule={onUpdateRule}
          onRemoveRule={onRemoveRule}
        />
      )}

      {!hideFooter && <FilterPanelFooter deferFilters={deferFilters} onClose={onClose} onApply={onApply} />}
    </div>
  );
};
