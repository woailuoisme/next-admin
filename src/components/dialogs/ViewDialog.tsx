"use client";

import { Edit } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { SheetDescription, SheetFooter, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "cn";

import { ModalFrame } from "./ModalFrame";
import { PageHeader } from "./PageHeader";
import { DIALOG_BODY_CLASS, DIALOG_FOOTER_CLASS } from "./sizeClasses";
import type { ViewDialogProps } from "./types";
import { useBackNavigation } from "./useBackNavigation";

function ViewOverlayHeader({
	title,
	description,
	badge,
	extraActions,
	onEdit,
	editText,
	isSheet,
}: {
	title: ReactNode;
	description?: ReactNode;
	badge?: ReactNode;
	extraActions?: ReactNode;
	onEdit?: () => void;
	editText: ReactNode;
	isSheet: boolean;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center justify-between gap-3 pr-6">
				<div className="flex items-center gap-2.5">
					{isSheet ? (
						<SheetTitle className="text-foreground text-lg font-semibold tracking-tight">{title}</SheetTitle>
					) : (
						<DialogTitle className="text-foreground text-lg font-semibold tracking-tight">{title}</DialogTitle>
					)}
					{badge ? <div>{badge}</div> : null}
				</div>
				<div className="flex items-center gap-2">
					{extraActions ?? null}
					{onEdit ? (
						<Button type="button" variant="outline" size="sm" onClick={onEdit} className="text-xs shadow-xs">
							<Edit data-icon="inline-start" aria-hidden="true" />
							{editText}
						</Button>
					) : null}
				</div>
			</div>
			{description ? (
				isSheet ? (
					<SheetDescription className="text-muted-foreground text-xs leading-normal">{description}</SheetDescription>
				) : (
					<DialogDescription className="text-muted-foreground text-xs leading-normal">{description}</DialogDescription>
				)
			) : null}
		</div>
	);
}

/**
 * 统一三态详情宿主（`dialog` 居中弹窗 / `drawer` 右侧抽屉 / `page` 独立路由页）。
 */
export function ViewDialog({
	open = true,
	onOpenChange,
	variant = "dialog",
	presentation,
	size = "md",
	widthClassName,
	title,
	description,
	badge,
	breadcrumbs,
	backTo,
	backLabel,
	loading = false,
	onEdit,
	editText,
	closeText,
	extraActions,
	children,
	className,
	footerClassName,
	allowFullscreen = false,
	fullscreen: controlledFullscreen,
	onFullscreenChange,
}: ViewDialogProps) {
	const tDialog = useTranslations("dialog");
	const tResource = useTranslations("resource");
	const tCommon = useTranslations("common");
	const handleBack = useBackNavigation(backTo);

	const resolvedSurface = presentation === "drawer" ? "sheet" : (presentation ?? variant);
	const isPage = resolvedSurface === "page";
	const resolvedTitle = title ?? tDialog("view_title", { entityName: tDialog("default_entity") });
	const resolvedEditText = editText ?? tDialog("edit");
	const resolvedCloseText = closeText ?? (isPage ? tResource("back_to_list") : tDialog("close"));

	const loadingSpinner = (
		<div role="status" aria-label={tCommon("loading_page_aria")} className="flex h-64 items-center justify-center">
			<Spinner role={undefined} aria-hidden="true" className="text-primary size-6" />
			<span className="sr-only">{tCommon("loading_page_aria")}</span>
		</div>
	);

	if (isPage) {
		const pageActions = (
			<div className="flex items-center gap-2">
				{extraActions}
				{onEdit ? (
					<Button type="button" variant="outline" size="sm" onClick={onEdit} className="text-xs shadow-xs">
						<Edit data-icon="inline-start" aria-hidden="true" />
						{resolvedEditText}
					</Button>
				) : null}
			</div>
		);

		return (
			<div className={cn("space-y-6", className)}>
				<PageHeader
					title={resolvedTitle}
					description={description}
					badge={badge}
					breadcrumbs={breadcrumbs}
					backTo={backTo}
					backLabel={backLabel}
					extraActions={pageActions}
				/>
				{loading ? loadingSpinner : <div className="flex flex-col gap-6">{children}</div>}
				<div className={cn("border-border/70 flex items-center justify-between border-t pt-4", footerClassName)}>
					<Button type="button" variant="outline" onClick={handleBack} className="h-8.5 px-4 text-xs font-medium">
						{resolvedCloseText}
					</Button>
				</div>
			</div>
		);
	}

	const isSheet = resolvedSurface === "sheet";
	const Footer = isSheet ? SheetFooter : DialogFooter;

	return (
		<ModalFrame
			open={open}
			onOpenChange={(next) => onOpenChange?.(next)}
			variant={resolvedSurface}
			size={size}
			widthClassName={widthClassName}
			className={className}
			allowFullscreen={allowFullscreen}
			fullscreen={controlledFullscreen}
			onFullscreenChange={onFullscreenChange}
			headerSlot={
				<ViewOverlayHeader
					title={resolvedTitle}
					description={description}
					badge={badge}
					extraActions={extraActions}
					onEdit={onEdit}
					editText={resolvedEditText}
					isSheet={isSheet}
				/>
			}
		>
			<div className={DIALOG_BODY_CLASS}>{loading ? loadingSpinner : children}</div>
			<Footer className={cn(DIALOG_FOOTER_CLASS, footerClassName)}>
				<Button
					type="button"
					variant="outline"
					onClick={() => onOpenChange?.(false)}
					className="h-8.5 px-4 text-xs font-medium"
				>
					{resolvedCloseText}
				</Button>
			</Footer>
		</ModalFrame>
	);
}
