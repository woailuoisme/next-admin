import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { DataTableQuickFilterProps } from "../types";

import { useQuickFilter } from "../hooks/useQuickFilter";

export function DataTableQuickFilter({
  value = "",
  onChange,
  placeholder,
  entity,
  debounceWait = 250,
  className,
}: DataTableQuickFilterProps) {
  const t = useTranslations("table");
  const resolvedPlaceholder =
    placeholder ?? (entity ? t("quick_filter_placeholder_entity", { entity }) : t("quick_filter_placeholder"));

  const { search, handleSearchChange, handleClearSearch } = useQuickFilter({
    value,
    onChange,
    debounceWait,
  });

  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 size-3.5" />
      <Input
        placeholder={resolvedPlaceholder}
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="h-8 pr-7 pl-8 text-xs"
      />
      {search && (
        <button
          type="button"
          onClick={handleClearSearch}
          className="text-muted-foreground hover:text-foreground absolute top-2 right-2 cursor-pointer"
          aria-label={t("quick_filter_clear")}
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
