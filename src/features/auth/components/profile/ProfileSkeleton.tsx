import { PageSkeletonRegion } from "@/components/shared/PageSkeletonRegion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 个人中心加载骨架：精确匹配 `ProfilePage` 的标题 + 12 栅格双栏（左名片 + 右三 Tab 表单）排版。
 */
export function ProfileSkeleton() {
	return (
		<PageSkeletonRegion>
			<div className="flex flex-col gap-1.5">
				<Skeleton className="h-8 w-44" />
				<Skeleton className="h-4 w-80 max-w-full" />
			</div>

			<div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
				<div className="lg:col-span-4">
					<Card>
						<CardContent className="flex flex-col gap-5 p-6">
							<div className="flex flex-col items-center">
								<Skeleton className="size-20 rounded-full" />
								<Skeleton className="mt-3 h-5 w-32" />
								<Skeleton className="mt-1.5 h-3.5 w-44" />
								<div className="mt-3 flex gap-2">
									<Skeleton className="h-5 w-16 rounded-full" />
									<Skeleton className="h-5 w-14 rounded-full" />
								</div>
							</div>
							<Separator />
							<div className="flex flex-col gap-3">
								<Skeleton className="h-3.5 w-full" />
								<Skeleton className="h-3.5 w-full" />
								<Skeleton className="h-3.5 w-full" />
							</div>
							<Separator />
							<div className="flex flex-col gap-2.5">
								<Skeleton className="h-3.5 w-20" />
								<Skeleton className="h-3.5 w-36" />
								<Skeleton className="h-3.5 w-44" />
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="flex flex-col gap-4 lg:col-span-8">
					<Skeleton className="h-9 w-full rounded-lg" />
					<Card>
						<CardContent className="flex flex-col gap-5 p-6">
							<div className="flex flex-col gap-1.5">
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-3.5 w-64 max-w-full" />
							</div>
							<div className="flex flex-col gap-2">
								<Skeleton className="h-3.5 w-20" />
								<Skeleton className="h-9 w-full rounded-md" />
							</div>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="flex flex-col gap-2">
									<Skeleton className="h-3.5 w-20" />
									<Skeleton className="h-9 w-full rounded-md" />
								</div>
								<div className="flex flex-col gap-2">
									<Skeleton className="h-3.5 w-20" />
									<Skeleton className="h-9 w-full rounded-md" />
								</div>
							</div>
							<div className="flex flex-col gap-2">
								<Skeleton className="h-3.5 w-20" />
								<Skeleton className="h-9 w-full rounded-md" />
								<div className="flex gap-2.5 pt-1">
									<Skeleton className="size-9 rounded-full" />
									<Skeleton className="size-9 rounded-full" />
									<Skeleton className="size-9 rounded-full" />
									<Skeleton className="size-9 rounded-full" />
								</div>
							</div>
							<div className="flex justify-end pt-2">
								<Skeleton className="h-9 w-24 rounded-md" />
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</PageSkeletonRegion>
	);
}
