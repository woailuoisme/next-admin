"use client";

import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "cn";

export interface MapSkeletonProps {
	height?: number | string;
	className?: string;
	message?: string;
}

export function MapSkeleton({ height = 400, className, message }: MapSkeletonProps) {
	const t = useTranslations("map");
	const resolvedMessage = message ?? t("skeleton_loading");

	return (
		<div
			className={cn(
				"border-border/50 bg-muted/20 relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border select-none",
				className,
			)}
			style={{ height }}
			role="status"
			aria-label={resolvedMessage}
		>
			<div
				className="absolute inset-0 opacity-25"
				style={{
					backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
					backgroundSize: "24px 24px",
				}}
			/>

			<div className="relative z-10 flex flex-col items-center gap-3">
				<div className="bg-primary/10 relative flex size-14 items-center justify-center rounded-full">
					<div
						aria-hidden="true"
						className="bg-primary/20 absolute size-full animate-ping rounded-full duration-1000 motion-reduce:animate-none"
					/>
					<MapPin aria-hidden="true" className="text-primary size-6" />
				</div>

				<div className="text-muted-foreground flex items-center gap-2 text-xs">
					<Spinner role={undefined} aria-hidden="true" className="text-primary size-3.5 motion-reduce:animate-none" />
					<span>{resolvedMessage}</span>
				</div>
			</div>
		</div>
	);
}
