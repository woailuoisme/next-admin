import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { clamp } from "es-toolkit";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { memo, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { DataTablePaginationModel } from "../core/types";

import { DEFAULT_PAGE_SIZE_OPTIONS } from "../core/constants";

export interface DataTablePaginationProps {
  paginationModel: DataTablePaginationModel;
  onPaginationModelChange: (model: DataTablePaginationModel) => void;
  rowCount: number;
  pageSizeOptions?: readonly number[];
  variant?: "capsule" | "shadcn" | "simple";
  className?: string;

  /** 总结文案自定义渲染插槽 */
  renderSummary?: (info: { from: number; to: number; total: number }) => React.ReactNode;
}

function getPaginationPages(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Near beginning: 1, 2, 3, 4, ..., totalPages - 1, totalPages
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", totalPages - 1, totalPages];
  }

  // Near end: 1, 2, ..., totalPages - 3, totalPages - 2, totalPages - 1, totalPages
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // In the middle: 1, ..., page - 1, page, page + 1, ..., totalPages
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export const DataTablePagination = memo(function DataTablePagination({
  paginationModel,
  onPaginationModelChange,
  rowCount,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  variant = "capsule",
  className,
  renderSummary,
}: DataTablePaginationProps) {
  const t = useTranslations("table");
  const { page, pageSize } = paginationModel;
  const totalPages = Math.max(1, Math.ceil(rowCount / pageSize));

  const from = rowCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, rowCount);

  const handlePageChange = useMemoizedFn((newPage: number) => {
    const bounded = clamp(newPage, 1, totalPages);
    onPaginationModelChange({ page: bounded, pageSize });
  });

  const handlePageSizeChange = useMemoizedFn((newSize: number) => {
    onPaginationModelChange({ page: 1, pageSize: newSize });
  });

  const paginationPages = useMemo(() => getPaginationPages(page, totalPages), [page, totalPages]);

  const mergedPageSizeOptions = useMemo(() => {
    if (pageSize && !pageSizeOptions.includes(pageSize)) {
      return [pageSize, ...pageSizeOptions].sort((a, b) => a - b);
    }
    return pageSizeOptions;
  }, [pageSizeOptions, pageSize]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 border-t border-border/50 bg-card/30 px-3.5 py-2",
        className,
      )}
    >
      {/* Left: Summary info */}
      <div className="text-muted-foreground text-xs select-none">
        {renderSummary
          ? renderSummary({ from, to, total: rowCount })
          : t("pagination_summary", { from, to, total: rowCount })}
      </div>

      {/* Center: Segmented page size selector [ 每页 | 10 ∨ ] */}
      <div className="divide-border/60 border-primary/80 bg-background focus-within:border-primary focus-within:ring-primary/20 hover:border-primary inline-flex h-8 items-center divide-x overflow-hidden rounded-lg border text-xs shadow-2xs transition-colors focus-within:ring-2">
        <span className="text-foreground flex h-full items-center px-2.5 font-medium select-none">
          {t("pagination_page_size_prefix")}
        </span>
        <Select value={String(pageSize)} onValueChange={(val) => handlePageSizeChange(Number(val))}>
          <SelectTrigger className="h-8 min-w-12 rounded-none border-0 bg-transparent py-0 pr-2 pl-2.5 font-mono text-xs shadow-none hover:bg-transparent focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent">
            <SelectValue placeholder={String(pageSize)}>{pageSize}</SelectValue>
          </SelectTrigger>
          <SelectContent side="top">
            {mergedPageSizeOptions.map((opt) => (
              <SelectItem key={opt} value={String(opt)} className="font-mono text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right: Navigation controls */}
      <div className="flex items-center">
        {variant === "capsule" && (
          <Pagination
            aria-label="Pagination Navigation"
            className="divide-border/60 border-border/70 bg-background mx-0 inline-flex h-8 w-auto items-center divide-x overflow-hidden rounded-lg border shadow-2xs"
          >
            <PaginationContent className="divide-border/60 h-full gap-0 divide-x">
              {/* Previous button - only shown when page > 1 */}
              {page > 1 && (
                <PaginationItem>
                  <PaginationLink
                    role="button"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page - 1);
                    }}
                    title={t("pagination_previous")}
                    aria-label={t("pagination_previous")}
                    className="text-muted-foreground hover:bg-muted/50 hover:text-foreground flex h-full min-w-8 items-center justify-center rounded-none border-0 px-2 shadow-none"
                  >
                    <ChevronLeft className="size-4" />
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Pages with sliding window */}
              {paginationPages.map((item, idx) => {
                if (item === "...") {
                  return (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <span className="text-muted-foreground flex h-full min-w-8 items-center justify-center px-1 font-mono text-xs select-none">
                        ...
                      </span>
                    </PaginationItem>
                  );
                }

                const isActive = item === page;
                return (
                  <PaginationItem key={item}>
                    <PaginationLink
                      role="button"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(item);
                      }}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex h-full min-w-8 items-center justify-center rounded-none border-0 px-2.5 font-mono text-xs shadow-none transition-colors",
                        isActive
                          ? "bg-background font-bold text-primary hover:bg-background hover:text-primary"
                          : "font-medium text-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {/* Next button - only shown when page < totalPages */}
              {page < totalPages && (
                <PaginationItem>
                  <PaginationLink
                    role="button"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page + 1);
                    }}
                    title={t("pagination_next")}
                    aria-label={t("pagination_next")}
                    className="text-muted-foreground hover:bg-muted/50 hover:text-foreground flex h-full min-w-8 items-center justify-center rounded-none border-0 px-2 shadow-none"
                  >
                    <ChevronRight className="size-4" />
                  </PaginationLink>
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}

        {variant === "shadcn" && (
          <Pagination aria-label="Pagination Navigation" className="mx-0 w-auto">
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  role="button"
                  href="#"
                  text={t("pagination_previous")}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) handlePageChange(page - 1);
                  }}
                  className={cn("cursor-pointer text-xs", page <= 1 && "pointer-events-none opacity-40")}
                />
              </PaginationItem>

              {paginationPages.map((item, idx) => {
                if (item === "...") {
                  return (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                const isActive = item === page;
                return (
                  <PaginationItem key={item}>
                    <PaginationLink
                      role="button"
                      href="#"
                      isActive={isActive}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(item);
                      }}
                      className="cursor-pointer font-mono text-xs"
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  role="button"
                  href="#"
                  text={t("pagination_next")}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) handlePageChange(page + 1);
                  }}
                  className={cn("cursor-pointer text-xs", page >= totalPages && "pointer-events-none opacity-40")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {variant === "simple" && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground size-7 disabled:opacity-40"
              onClick={() => handlePageChange(1)}
              disabled={page <= 1}
              title={t("pagination_first")}
              aria-label={t("pagination_first")}
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground size-7 disabled:opacity-40"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              title={t("pagination_previous")}
              aria-label={t("pagination_previous")}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="px-1.5 font-mono text-xs font-medium">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground size-7 disabled:opacity-40"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              title={t("pagination_next")}
              aria-label={t("pagination_next")}
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground size-7 disabled:opacity-40"
              onClick={() => handlePageChange(totalPages)}
              disabled={page >= totalPages}
              title={t("pagination_last")}
              aria-label={t("pagination_last")}
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});
