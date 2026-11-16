"use client";

import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { memo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

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
  searchPlaceholder,
  showCategoryFilter,
  categories,
  selectedCategory,
  onCategoryChange,
  totalCount,
  categoryCounts,
}: LocationMarkerSearchOverlayProps) {
  const t = useTranslations("map");
  const effectivePlaceholder = searchPlaceholder ?? t("markers_search_placeholder");

  if (!showSearch && (!showCategoryFilter || categories.length === 0)) {
    return null;
  }

  return (
    <div className="border-border/60 bg-background/90 absolute top-3 right-14 left-3 z-10 flex max-w-sm flex-col gap-2 rounded-lg border p-2.5 shadow-md backdrop-blur-md">
      {showSearch ? (
        <div className="relative w-full">
          <Search aria-hidden="true" className="text-muted-foreground absolute top-2.5 left-2.5 size-3.5" />
          <Input
            placeholder={effectivePlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label={effectivePlaceholder}
            className="bg-muted/40 h-8 pr-7 pl-8 text-xs"
          />
          {searchQuery ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onSearchChange("")}
              className="text-muted-foreground hover:text-foreground absolute top-1 right-1 size-6"
              aria-label={t("markers_clear_search")}
            >
              <X aria-hidden="true" className="size-3.5" />
            </Button>
          ) : null}
        </div>
      ) : null}

      {showCategoryFilter && categories.length > 0 ? (
        <div className="flex flex-wrap gap-1" role="group" aria-label={t("markers_category_filter_aria")}>
          <Button
            type="button"
            variant={selectedCategory === null ? "default" : "secondary"}
            size="sm"
            aria-pressed={selectedCategory === null}
            onClick={() => onCategoryChange(null)}
            className={cn("h-6 rounded-full px-2.5 text-[11px] font-medium")}
          >
            {t("markers_category_all", { count: totalCount })}
          </Button>
          {categories.map((cat) => {
            const count = categoryCounts[cat] ?? 0;
            const isSelected = selectedCategory === cat;
            return (
              <Button
                key={cat}
                type="button"
                variant={isSelected ? "default" : "secondary"}
                size="sm"
                aria-pressed={isSelected}
                onClick={() => onCategoryChange(isSelected ? null : cat)}
                className={cn("h-6 rounded-full px-2.5 text-[11px] font-medium")}
              >
                {cat} ({count})
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
});
