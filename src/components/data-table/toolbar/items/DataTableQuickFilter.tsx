import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { DataTableQuickFilterProps } from "../types";

import { useQuickFilter } from "../hooks/useQuickFilter";

export function DataTableQuickFilter({
  value = "",
  onChange,
  placeholder = "Search records...",
  debounceWait = 250,
  className,
}: DataTableQuickFilterProps) {
  const { search, handleSearchChange, handleClearSearch } = useQuickFilter({
    value,
    onChange,
    debounceWait,
  });

  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 size-3.5" />
      <Input
        placeholder={placeholder}
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="h-8 pr-7 pl-8 text-xs"
      />
      {search && (
        <button
          type="button"
          onClick={handleClearSearch}
          className="text-muted-foreground hover:text-foreground absolute top-2 right-2"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
