"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";

import { FormBodyRegion } from "@/components/form/core/FormContext";
import { DialogFooter } from "@/components/ui/dialog";
import { SheetFooter } from "@/components/ui/sheet";
import { cn } from "cn";

import { FormActionButtons } from "./FormActionButtons";
import { useFormSurfaceState } from "./hooks/useFormSurfaceState";
import { ModalFrame } from "./ModalFrame";
import { PageHeader } from "./PageHeader";
import { DIALOG_BODY_CLASS, DIALOG_FOOTER_CLASS } from "./sizeClasses";
import type { FormDialogProps } from "./types";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";

/**
 * 统一三态表单宿主（`dialog` 居中弹窗 / `drawer` 右侧抽屉 / `page` 独立路由页）：
 * 共享同一套脏状态守卫、异步提交互斥锁、标题语义推导与底部操作栏。
 */
export function FormDialog<TData = Record<string, unknown>>(props: FormDialogProps<TData>) {
	const {
		open = true,
		variant = "dialog",
		presentation,
		widthClassName,
		description,
		badge,
		size = "md",
		breadcrumbs,
		backTo,
		backLabel,
		onSaveAndContinue,
		loading = false,
		isSubmitting = false,
		children,
		extraFooterActions,
		extraActions,
		className,
		footerClassName,
		allowFullscreen = false,
		fullscreen: controlledFullscreen,
		onFullscreenChange,
	} = props;

	const tDialog = useTranslations("dialog");
	const tResource = useTranslations("resource");
	const tCommon = useTranslations("common");
	const formId = useId();

	const resolvedSurface = presentation === "drawer" ? "sheet" : (presentation ?? variant);
	const isPage = resolvedSurface === "page";
	const state = useFormSurfaceState({ ...props, isPage });
	const resolvedExtraActions = extraActions ?? extraFooterActions;

	const discardDialog = (
		<UnsavedChangesDialog
			open={state.showDiscardConfirm}
			onOpenChange={state.setShowDiscardConfirm}
			title={isPage ? tResource("unsaved_changes_title") : tDialog("unsaved_changes_title")}
			description={isPage ? tResource("unsaved_changes_confirm") : tDialog("unsaved_changes_desc")}
			stayText={isPage ? tResource("unsaved_changes_stay") : tDialog("unsaved_changes_stay")}
			discardText={isPage ? tResource("unsaved_changes_discard") : tDialog("unsaved_changes_discard")}
			onConfirmDiscard={state.handleConfirmDiscard}
		/>
	);

	if (isPage) {
		return (
			<div className={cn("space-y-6", className)}>
				<PageHeader
					title={state.baseTitle}
					description={description}
					badge={badge}
					breadcrumbs={breadcrumbs}
					backTo={backTo}
					backLabel={backLabel}
				/>

				{/* 本组件拥有 <form> 元素：children 只能是字段内容，严禁再嵌套 form / <Form as="form"> */}
				<form onSubmit={state.handleFormSubmit} className="space-y-6">
					<FormBodyRegion
						formContextValue={state.formContextValue}
						loading={loading}
						loadingLabel={tCommon("loading_page_aria")}
						className="min-h-75 space-y-6"
						contentClassName="space-y-6"
					>
						{children}
					</FormBodyRegion>

					<div
						className={cn(
							"border-border/70 bg-background/85 sticky bottom-0 z-20 -mx-4 flex flex-row items-center justify-between gap-3 border-t px-4 py-3.5 backdrop-blur-md transition-all md:-mx-6 md:px-6 lg:-mx-8 lg:px-8",
							footerClassName,
						)}
					>
						<FormActionButtons
							variant="page"
							isSubmitting={isSubmitting}
							isSubmitBlocked={state.isSubmitBlocked}
							cancelText={state.resolvedCancelText}
							saveAndContinueText={state.resolvedSaveAndContinueText}
							submitText={state.displaySubmitText}
							showSaveAndContinue={Boolean(onSaveAndContinue)}
							extraActions={resolvedExtraActions}
							onCancel={state.handleCancel}
							onSaveAndContinue={() => void state.handleSaveAndContinueClick()}
						/>
					</div>
				</form>

				{discardDialog}
			</div>
		);
	}

	const resolvedTitle = badge ? (
		<span className="inline-flex items-center gap-2.5">
			<span>{state.baseTitle}</span>
			{badge}
		</span>
	) : (
		state.baseTitle
	);
	const Footer = resolvedSurface === "sheet" ? SheetFooter : DialogFooter;

	return (
		<>
			<ModalFrame
				open={open}
				onOpenChange={state.handleOpenChange}
				variant={resolvedSurface}
				size={size}
				widthClassName={widthClassName}
				className={className}
				allowFullscreen={allowFullscreen}
				fullscreen={controlledFullscreen}
				onFullscreenChange={onFullscreenChange}
				title={resolvedTitle}
				description={description}
			>
				<form id={formId} onSubmit={state.handleFormSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
					<FormBodyRegion
						formContextValue={state.formContextValue}
						loading={loading}
						loadingLabel={tCommon("loading_page_aria")}
						className={DIALOG_BODY_CLASS}
						bannerClassName="mb-4"
					>
						{children}
					</FormBodyRegion>

					<Footer className={cn(DIALOG_FOOTER_CLASS, footerClassName)}>
						<FormActionButtons
							variant="overlay"
							isSubmitting={isSubmitting}
							isSubmitBlocked={state.isSubmitBlocked}
							cancelText={state.resolvedCancelText}
							saveAndContinueText={state.resolvedSaveAndContinueText}
							submitText={state.displaySubmitText}
							showSaveAndContinue={Boolean(onSaveAndContinue)}
							extraActions={resolvedExtraActions}
							onCancel={state.handleCancel}
							onSaveAndContinue={() => void state.handleSaveAndContinueClick()}
						/>
					</Footer>
				</form>
			</ModalFrame>
			{discardDialog}
		</>
	);
}
