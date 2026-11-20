import { PageSkeletonRegion } from "@/components/shared/PageSkeletonRegion";
import { Skeleton } from "@/components/ui/skeleton";

const KPI_CARD_KEYS = [1, 2, 3, 4] as const;
const TABLE_HEADER_KEYS = [1, 2, 3, 4, 5] as const;
const TABLE_ROW_KEYS = [1, 2, 3, 4, 5, 6] as const;
const FORM_FIELD_KEYS = [1, 2, 3, 4] as const;

export interface ResourceListSkeletonProps {
  /** 是否包含顶部 4 列 KPI 统计卡片骨架（如商品、订单列表） */
  withStats?: boolean;
  /** 可选无障碍提示文案 */
  ariaLabel?: string;
}

export interface ResourceActionSkeletonProps {
  /** 可选无障碍提示文案 */
  ariaLabel?: string;
}

/**
 * 资源列表页骨架：匹配 `ResourceScaffold` + compact `StatsGrid` + `DataTable` 单卡片外框排版。
 */
export function ResourceListSkeleton({ withStats = true, ariaLabel }: ResourceListSkeletonProps) {
  return (
    <PageSkeletonRegion ariaLabel={ariaLabel}>
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-3.5 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-28 self-start rounded-md sm:self-auto" />
      </div>

      {/* Optional 4-col Compact StatsGrid */}
      {withStats ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KPI_CARD_KEYS.map((key) => (
            <div key={key} className="border-border/60 bg-card space-y-1.5 rounded-xl border p-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="size-6 rounded-md" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-6 w-28" />
                <div className="flex items-center justify-between pt-0.5">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-4.5 w-14" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* DataTable Single Card Frame: Toolbar + Table + Pagination */}
      <div className="border-border/60 bg-card overflow-hidden rounded-xl border shadow-xs">
        <div className="border-border/50 bg-card/50 flex flex-wrap items-center justify-between gap-3 border-b p-2.5">
          <Skeleton className="h-8 w-full rounded-md sm:w-64" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>

        <div className="bg-muted/40 border-border flex items-center gap-4 border-b px-4 py-3">
          <Skeleton className="size-4 shrink-0 rounded" />
          {TABLE_HEADER_KEYS.map((key) => (
            <Skeleton key={key} className="h-3.5 flex-1" />
          ))}
          <Skeleton className="h-3.5 w-16 shrink-0" />
        </div>

        <div className="divide-border divide-y">
          {TABLE_ROW_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="size-4 shrink-0 rounded" />
              <div className="flex min-w-0 flex-[1.5] items-center gap-3">
                <Skeleton className="size-8 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-36 max-w-full" />
                  <Skeleton className="h-3 w-24 max-w-full" />
                </div>
              </div>
              <Skeleton className="hidden h-5 w-20 rounded-full sm:block" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="hidden h-4 flex-1 md:block" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <div className="flex shrink-0 items-center gap-1.5">
                <Skeleton className="size-7 rounded-md" />
                <Skeleton className="size-7 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        <div className="border-border/50 bg-card/30 flex flex-wrap items-center justify-between gap-4 border-t px-3.5 py-2">
          <Skeleton className="h-4 w-44 max-w-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
        </div>
      </div>
    </PageSkeletonRegion>
  );
}

/**
 * 资源详情/表单子页骨架：匹配 `ResourcePageHeader` + `ResourceFormPage` / `ResourceViewPage`。
 */
export function ResourceActionSkeleton({ ariaLabel }: ResourceActionSkeletonProps = {}) {
  return (
    <PageSkeletonRegion ariaLabel={ariaLabel}>
      {/* Breadcrumb + Header */}
      <div className="border-border/70 space-y-3 border-b pb-5">
        <Skeleton className="h-3.5 w-44 max-w-full" />
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-md" />
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-48 max-w-full" />
              <Skeleton className="h-3.5 w-64 max-w-full" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      {/* Section Cards */}
      <div className="border-border bg-card space-y-5 rounded-xl border p-6">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3.5 w-56 max-w-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FORM_FIELD_KEYS.map((key) => (
            <div key={key} className="space-y-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <div className="border-border bg-card space-y-5 rounded-xl border p-6">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3.5 w-48 max-w-full" />
        </div>
        <Skeleton className="h-28 w-full rounded-md" />
      </div>

      {/* Bottom Bar Skeleton */}
      <div className="border-border/70 flex items-center justify-between border-t pt-4">
        <Skeleton className="h-8.5 w-20 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8.5 w-28 rounded-md" />
          <Skeleton className="h-8.5 w-24 rounded-md" />
        </div>
      </div>
    </PageSkeletonRegion>
  );
}
