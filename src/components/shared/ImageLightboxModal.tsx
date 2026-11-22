"use client";

import { useMemoizedFn } from "ahooks";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { sanitizeUrl } from "./url";

export interface ImageLightboxModalProps {
	/** 待预览图片地址（与 `url` 兼容，优先取 `url ?? previewUrl`） */
	previewUrl?: string | null;
	url?: string | null;
	images?: string[];
	initialIndex?: number;
	alt?: string;
	onClose: () => void;
}

function clampIndex(idx: number, length: number): number {
	return length === 0 ? 0 : Math.min(Math.max(0, idx), length - 1);
}

function ImageLightboxModalInner({
	previewUrl,
	url,
	images = [],
	initialIndex = 0,
	alt,
	onClose,
}: ImageLightboxModalProps) {
	const t = useTranslations("common");
	const resolvedAlt = alt ?? t("image_preview_alt");
	const resolvedPreviewUrl = url ?? previewUrl ?? null;
	// Active images list for gallery navigation
	const activeImages = images.length > 0 ? images : resolvedPreviewUrl ? [resolvedPreviewUrl] : [];

	const foundInitialIndex = resolvedPreviewUrl && images.length > 0 ? images.indexOf(resolvedPreviewUrl) : -1;
	const resolvedInitialIndex = foundInitialIndex >= 0 ? foundInitialIndex : initialIndex;

	const resetKey = `${resolvedPreviewUrl ?? ""}::${images.length}::${initialIndex}`;
	const [navState, setNavState] = useState<{ resetKey: string; index: number } | null>(null);
	const [failedUrl, setFailedUrl] = useState<string | null>(null);

	const rawIndex = navState && navState.resetKey === resetKey ? navState.index : resolvedInitialIndex;
	const currentIndex = clampIndex(rawIndex, activeImages.length);

	// 跨 window keydown 监听器的稳定翻页回调（AGENTS.md §5 白名单：useMemoizedFn）
	const stepIndex = useMemoizedFn((delta: number) => {
		if (activeImages.length === 0) return;
		setNavState((prev) => {
			const base = clampIndex(
				prev && prev.resetKey === resetKey ? prev.index : resolvedInitialIndex,
				activeImages.length,
			);
			const next = (base + delta + activeImages.length) % activeImages.length;
			return { resetKey, index: next };
		});
	});

	const rawCurrentUrl = activeImages[currentIndex] || resolvedPreviewUrl;
	const currentUrl = rawCurrentUrl ? (sanitizeUrl(rawCurrentUrl) ?? undefined) : undefined;
	const hasLoadError = Boolean(currentUrl && failedUrl === currentUrl);
	const hasMultiple = activeImages.length > 1;

	// Keyboard arrow navigation
	useEffect(() => {
		if (!resolvedPreviewUrl || !hasMultiple) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				stepIndex(-1);
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				stepIndex(1);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [resolvedPreviewUrl, hasMultiple, stepIndex]);

	return (
		<Dialog open={Boolean(resolvedPreviewUrl)} onOpenChange={(open) => !open && onClose()}>
			{/* 补 `sm:max-w-3xl`：DialogContent 基础含 `sm:max-w-sm`，裸 `max-w-3xl` 不在同一
			    合并组内会被它击败 → ≥640px 时灯箱被压到 24rem，大图无法正常查看。 */}
			<DialogContent className="border-border bg-background/95 max-w-3xl overflow-hidden p-3 backdrop-blur-md sm:max-w-3xl">
				<DialogTitle className="sr-only">{resolvedAlt}</DialogTitle>
				{currentUrl ? (
					<div className="relative flex max-h-[82vh] flex-col items-center justify-center overflow-hidden rounded-lg">
						<div className="relative flex max-h-[75vh] w-full items-center justify-center">
							{hasLoadError ? (
								<div
									role="status"
									className="border-border/60 bg-muted/40 text-muted-foreground flex h-48 w-full items-center justify-center rounded border text-xs"
								>
									{t("image_load_error")}
								</div>
							) : (
								<img
									src={currentUrl}
									alt={`${resolvedAlt} (${currentIndex + 1}/${activeImages.length})`}
									onError={() => setFailedUrl(currentUrl)}
									className="max-h-[72vh] w-auto max-w-full rounded object-contain shadow-md"
								/>
							)}

							{/* Gallery Navigation Controls */}
							{hasMultiple && (
								<>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										aria-label={t("previous_image")}
										className="bg-background/60 text-foreground hover:bg-background/90 absolute top-1/2 left-2 -translate-y-1/2 rounded-full backdrop-blur-xs"
										onClick={() => stepIndex(-1)}
									>
										<ChevronLeft className="size-5" aria-hidden="true" />
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										aria-label={t("next_image")}
										className="bg-background/60 text-foreground hover:bg-background/90 absolute top-1/2 right-2 -translate-y-1/2 rounded-full backdrop-blur-xs"
										onClick={() => stepIndex(1)}
									>
										<ChevronRight className="size-5" aria-hidden="true" />
									</Button>
								</>
							)}
						</div>

						{/* Footer with Alt & Counter */}
						<div className="text-muted-foreground mt-2.5 flex w-full items-center justify-between px-2 text-xs">
							<p className="truncate font-medium">{resolvedAlt}</p>
							{hasMultiple && (
								<span className="border-border/60 bg-muted/60 rounded-md border px-2 py-0.5 font-mono text-[11px]">
									{currentIndex + 1} / {activeImages.length}
								</span>
							)}
						</div>
					</div>
				) : null}
			</DialogContent>
		</Dialog>
	);
}

export const ImageLightboxModal = ImageLightboxModalInner;
