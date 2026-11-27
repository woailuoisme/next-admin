"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";

export interface RichEditorSkeletonProps {
	minHeight?: string | number;
	className?: string;
}

export function RichEditorSkeleton({ minHeight = 160, className }: RichEditorSkeletonProps) {
	return (
		<div
			className={cn("bg-card/40 flex flex-col overflow-hidden rounded-lg border", className)}
			style={{ minHeight }}
			data-testid="rich-editor-skeleton"
		>
			{/* Toolbar skeleton */}
			<div className="bg-muted/30 flex flex-wrap items-center gap-1.5 border-b p-1.5">
				<Skeleton className="size-7 rounded-sm" />
				<Skeleton className="size-7 rounded-sm" />
				<div className="bg-border/60 mx-0.5 h-4 w-px" />
				<Skeleton className="size-7 rounded-sm" />
				<Skeleton className="size-7 rounded-sm" />
				<div className="bg-border/60 mx-0.5 h-4 w-px" />
				<Skeleton className="size-7 rounded-sm" />
				<Skeleton className="size-7 rounded-sm" />
			</div>
			{/* Content skeleton */}
			<div className="flex flex-1 flex-col gap-2.5 p-4">
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-1/2" />
			</div>
		</div>
	);
}
