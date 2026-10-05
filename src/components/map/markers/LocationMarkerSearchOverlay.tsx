import { Search, X } from "lucide-react";
import { memo } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LocationMarkerSearchOverlayProps {
  showSearch: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  showCategoryFilter: boolean;
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
  totalCount: number;
  categoryCounts: Record<string, number>;
}

export const LocationMarkerSearchOverlay = memo(function LocationMarkerSearchOverlay({
  showSearch,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "搜索网点名称、地址或类型...",
  showCategoryFilter,
  categories,
  selectedCategory,
  onCategoryChange,
  totalCount,
  categoryCounts,
}: LocationMarkerSearchOverlayProps) {
  if (!showSearch && (!showCategoryFilter || categories.length === 0)) {
    return null;
  }

  return (
    <div className="border-border/60 bg-background/90 absolute top-3 left-3 z-10 flex max-w-sm flex-col gap-2 rounded-lg border p-2.5 shadow-md backdrop-blur-md">
      {showSearch ? (
        <div className="relative w-full">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-3.5" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-muted/40 h-8 pr-7 pl-8 text-xs"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="text-muted-foreground hover:text-foreground absolute top-2.5 right-2.5"
              aria-label="清空搜索"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      ) : null}

      {showCategoryFilter && categories.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            全部 ({totalCount})
          </button>
          {categories.map((cat) => {
            const count = categoryCounts[cat] ?? 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(isSelected ? null : cat)}
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
});
