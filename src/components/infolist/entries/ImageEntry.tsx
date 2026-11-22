"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import * as React from "react";

import { sanitizeUrl } from "@/components/shared/url";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

import type { ImageEntryProps } from "./types";

import { EntryWrapper } from "../core/EntryWrapper";
import { useInfolistFieldValue } from "../core/InfolistContext";

const DynamicImageLightboxModal = dynamic(
	() => import("@/components/shared/ImageLightboxModal").then((mod) => mod.ImageLightboxModal),
	{ ssr: false },
);

const sizeClasses = {
	sm: "size-8",
	md: "size-12",
	lg: "size-16",
	xl: "size-24",
};

const shapeClasses = {
	circular: "rounded-full",
	rounded: "rounded-lg",
	square: "rounded-none",
};

export function ImageEntry({
	name,
	value: explicitValue,
	alt = "Image",
	shape = "rounded",
	size = "md",
	lightbox = true,
	fallback,
	...wrapperProps
}: ImageEntryProps) {
	const t = useTranslations("infolist");
	const rawValue = useInfolistFieldValue(name, explicitValue);
	const [activeLightboxIndex, setActiveLightboxIndex] = React.useState<number | null>(null);
	const [failedUrls, setFailedUrls] = React.useState<Record<string, true>>({});

	const candidates = rawValue ? (Array.isArray(rawValue) ? rawValue : [rawValue]) : [];
	const images: string[] = [];
	for (const item of candidates) {
		if (typeof item !== "string") continue;
		const safe = sanitizeUrl(item, { allowRelative: true, allowBareDomain: false });
		if (safe) {
			images.push(safe);
		}
	}

	const healthyImages = images.filter((url) => !failedUrls[url]);

	const handleImageError = (url: string) => {
		setFailedUrls((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
	};

	if (images.length === 0) {
		return (
			<EntryWrapper {...wrapperProps}>
				{fallback ?? (
					<div
						className={cn(
							"flex items-center justify-center border border-dashed border-border bg-muted/60 px-1 text-center text-[11px] text-muted-foreground/70 select-none",
							sizeClasses[size],
							shapeClasses[shape],
						)}
					>
						{t("empty_image")}
					</div>
				)}
			</EntryWrapper>
		);
	}

	let healthyIdx = -1;
	const activePreviewUrl =
		activeLightboxIndex !== null && activeLightboxIndex >= 0 && activeLightboxIndex < healthyImages.length
			? healthyImages[activeLightboxIndex]
			: null;

	return (
		<EntryWrapper {...wrapperProps}>
			<div className="flex flex-wrap items-center gap-2">
				{images.map((url, idx) => {
					const isFailed = Boolean(failedUrls[url]);
					if (!isFailed) {
						healthyIdx += 1;
					}
					const currentHealthyIdx = healthyIdx;
					const mediaNode = isFailed ? (
						<div className="bg-muted/60 text-muted-foreground/70 flex h-full w-full items-center justify-center px-1 text-center text-[10px] select-none">
							{t("empty_image")}
						</div>
					) : (
						<img
							src={url}
							alt={`${alt} ${idx + 1}`}
							onError={() => handleImageError(url)}
							className="h-full w-full object-cover object-center"
							loading="lazy"
						/>
					);

					if (!lightbox || isFailed) {
						return (
							<div
								key={`${url}-${idx}`}
								className={cn(
									"relative shrink-0 overflow-hidden border border-border bg-muted/20",
									sizeClasses[size],
									shapeClasses[shape],
								)}
							>
								{mediaNode}
							</div>
						);
					}

					const previewLabel = t("preview_image", { index: String(idx + 1) });
					const buttonAriaLabel = alt && alt !== "Image" ? `${previewLabel} - ${alt}` : previewLabel;

					return (
						<Button
							key={`${url}-${idx}`}
							type="button"
							variant="ghost"
							aria-label={buttonAriaLabel}
							onClick={() => setActiveLightboxIndex(currentHealthyIdx)}
							className={cn(
								"group relative shrink-0 cursor-zoom-in overflow-hidden border border-border bg-muted/20 p-0 transition-all hover:ring-2 hover:ring-primary/40",
								sizeClasses[size],
								shapeClasses[shape],
							)}
						>
							{mediaNode}
						</Button>
					);
				})}
			</div>

			{lightbox && activeLightboxIndex !== null && activePreviewUrl && (
				<DynamicImageLightboxModal
					previewUrl={activePreviewUrl}
					images={healthyImages}
					initialIndex={activeLightboxIndex}
					alt={alt}
					onClose={() => setActiveLightboxIndex(null)}
				/>
			)}
		</EntryWrapper>
	);
}
