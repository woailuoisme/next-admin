import { PageSkeletonRegion } from "@/components/shared/PageSkeletonRegion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ROW_KEYS = [1, 2, 3, 4, 5] as const;

/**
 * 个人通知中心加载骨架：精确匹配 `NotificationsPage` 头部 + Tabs + 筛选栏 + 批量条 + 通知行布局。
 */
export function NotificationsSkeleton() {
	return (
		<PageSkeletonRegion>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1.5">
					<div className="flex items-center gap-2.5">
						<Skeleton className="h-8 w-40" />
						<Skeleton className="h-5 w-16 rounded-full" />
					</div>
					<Skeleton className="h-4 w-80 max-w-full" />
				</div>
				<Skeleton className="h-8 w-24 rounded-md" />
			</div>

			<div className="space-y-4">
				<Skeleton className="h-9 w-44 rounded-lg" />

				<Card>
					<CardContent className="space-y-4 p-4 sm:p-5">
						<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
							<Skeleton className="h-9 w-full max-w-72 rounded-lg" />
							<div className="flex flex-wrap items-center gap-3">
								<Skeleton className="h-9 w-full rounded-md sm:w-64" />
								<Skeleton className="h-5 w-20 rounded-full" />
							</div>
						</div>

						<Skeleton className="h-9 w-full rounded-lg" />

						<div className="divide-border border-border divide-y overflow-hidden rounded-lg border">
							{ROW_KEYS.map((key) => (
								<div key={key} className="flex items-start gap-3 p-3.5 sm:p-4">
									<Skeleton className="mt-1.5 size-4 shrink-0 rounded" />
									<Skeleton className="mt-0.5 size-9 shrink-0 rounded-full" />
									<div className="min-w-0 flex-1 space-y-2">
										<div className="flex items-center justify-between gap-2">
											<Skeleton className="h-4 w-52 max-w-full" />
											<Skeleton className="h-3.5 w-14 shrink-0" />
										</div>
										<Skeleton className="h-3.5 w-full max-w-xl" />
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</PageSkeletonRegion>
	);
}
