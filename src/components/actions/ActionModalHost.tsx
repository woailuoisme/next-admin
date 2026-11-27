"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { FormDialog } from "@/components/dialogs/FormDialog";
import { ModalFrame } from "@/components/dialogs/ModalFrame";
import { DIALOG_BODY_CLASS, DIALOG_FOOTER_CLASS } from "@/components/dialogs/sizeClasses";
import { useAppForm } from "@/components/form";
import { SchemaRenderer } from "@/components/schema";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { SheetFooter } from "@/components/ui/sheet";

import { ActionGroupView } from "./ActionGroup";
import { ActionTriggerButton } from "./ActionTriggerButton";
import { ExportActionModal } from "./prebuilt/ExportActionModal";
import { ImportActionModal } from "./prebuilt/ImportActionModal";
import type { ActionDef, ActionModalConfig, ActionRuntimeResourceBridge } from "./types";
import type { ActiveActionSession } from "./useActionRunner";
import { resolveActionValue } from "./utils";

export interface ActionModalHostProps<TPayload = any> {
	session: ActiveActionSession<TPayload> | null;
	pendingActionId: string | null;
	resourceBridge?: ActionRuntimeResourceBridge | null;
	onClose: () => void;
	onExecute: (
		action: ActionDef<TPayload, any>,
		payload: TPayload,
		formData: Record<string, unknown>,
		clearSelection?: () => void,
	) => Promise<void>;
	onTrigger: (action: ActionDef<any, any>, payload: any) => void;
}

/**
 * 集中式 Action 弹窗宿主：按当前激活会话自动挂载 Confirm / Form / SlideOver / Content / Import / Export 弹窗。
 */
export function ActionModalHost<TPayload = any>({
	session,
	pendingActionId,
	resourceBridge,
	onClose,
	onExecute,
	onTrigger,
}: ActionModalHostProps<TPayload>) {
	const t = useTranslations("actions");
	const tDialog = useTranslations("dialog");
	// 保留最近一次打开的会话节点，使 Dialog 关闭动画期间不会因 session 置空而瞬间闪烁卸载
	const [retainedSession, setRetainedSession] = useState(session);
	if (session && session !== retainedSession) {
		setRetainedSession(session);
	}
	const activeSession = session ?? retainedSession;
	if (!activeSession) return null;

	const isModalOpen = Boolean(session);
	const { action, payload, mode, clearSelection } = activeSession;
	const isPending = pendingActionId === action.id;
	const fallbackActionLabel =
		resolveActionValue(action.label, payload) ??
		(action.defaultLabelKey ? t(action.defaultLabelKey as never) : undefined);

	if (mode === "export" && action.builtinModal?.exportConfig) {
		return (
			<ExportActionModal
				open={isModalOpen}
				onOpenChange={(next) => {
					if (!next) onClose();
				}}
				config={action.builtinModal.exportConfig}
				payload={payload}
				resourceBridge={resourceBridge}
				onExported={clearSelection}
			/>
		);
	}

	if (mode === "import" && action.builtinModal?.importConfig) {
		return (
			<ImportActionModal
				open={isModalOpen}
				onOpenChange={(next) => {
					if (!next) onClose();
				}}
				config={action.builtinModal.importConfig}
				payload={payload}
				resourceBridge={resourceBridge}
			/>
		);
	}

	if (mode === "confirm") {
		const cfg = typeof action.confirm === "object" ? action.confirm : {};
		const confirmColor = cfg.color ?? action.color ?? "destructive";

		let defaultTitle = fallbackActionLabel;
		let defaultDescription = resolveActionValue(cfg.description, payload);

		if (!cfg.title && action.id === "crud-delete" && resourceBridge) {
			const entityName = resourceBridge.resource.entityName ?? tDialog("default_entity");
			const entityTitle = resourceBridge.resource.getTitle?.(payload as any);
			defaultTitle = tDialog("delete_item_title", { entityName });
			if (!defaultDescription) {
				defaultDescription = entityTitle
					? tDialog("delete_item_desc", { entityName: tDialog("delete_quoted_name", { name: entityTitle }) })
					: tDialog("delete_item_desc", { entityName });
			}
		} else if (!cfg.title && action.id === "crud-batch-delete" && Array.isArray(payload)) {
			const entityName = resourceBridge?.resource.entityName ?? tDialog("default_entity");
			defaultTitle = tDialog("delete_batch_title", { count: payload.length, entityName });
			if (!defaultDescription) {
				defaultDescription = tDialog("delete_batch_desc", { count: payload.length, entityName });
			}
		}

		return (
			<ConfirmDialog
				open={isModalOpen}
				onOpenChange={(next) => {
					if (!next) onClose();
				}}
				title={resolveActionValue(cfg.title, payload) ?? defaultTitle}
				description={defaultDescription}
				confirmText={resolveActionValue(cfg.confirmText, payload)}
				cancelText={resolveActionValue(cfg.cancelText, payload)}
				color={confirmColor}
				icon={cfg.icon ?? action.icon}
				requireConfirmKeyword={cfg.requireConfirmKeyword}
				confirmKeyword={cfg.confirmKeyword}
				autoFocusInput={cfg.autoFocusInput}
				isPending={isPending}
				onConfirm={async () => {
					await onExecute(action, payload, {}, clearSelection);
				}}
			/>
		);
	}

	const modal = resolveActionValue(action.modal, payload);
	if (!modal) return null;

	if (modal.renderForm || modal.fields?.length) {
		return (
			<ActionFormModalPanel
				open={isModalOpen}
				onOpenChange={(next) => {
					if (!next) onClose();
				}}
				action={action}
				payload={payload}
				modal={modal}
				isPending={isPending}
				onExecute={onExecute}
				clearSelection={clearSelection}
			/>
		);
	}

	return (
		<ActionContentModalPanel
			open={isModalOpen}
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
			action={action}
			payload={payload}
			modal={modal}
			pendingActionId={pendingActionId}
			onTrigger={onTrigger}
		/>
	);
}

interface ActionFormModalPanelProps<TPayload> {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	action: ActionDef<TPayload, any>;
	payload: TPayload;
	modal: ActionModalConfig<TPayload, any>;
	isPending: boolean;
	onExecute: (
		action: ActionDef<TPayload, any>,
		payload: TPayload,
		formData: Record<string, unknown>,
		clearSelection?: () => void,
	) => Promise<void>;
	clearSelection?: () => void;
}

function ActionFormModalPanel<TPayload>({
	open,
	onOpenChange,
	action,
	payload,
	modal,
	isPending,
	onExecute,
	clearSelection,
}: ActionFormModalPanelProps<TPayload>) {
	const t = useTranslations("actions");
	// 稳定 TanStack Form defaultValues 引用，避免提交 isPending 状态切换时重复派生新对象
	const initialValues = useMemo(
		() => (typeof modal.defaultValues === "function" ? modal.defaultValues(payload) : (modal.defaultValues ?? {})),
		[modal, payload],
	);

	const form = useAppForm({
		defaultValues: initialValues,
		validators: modal.schema ? { onSubmit: modal.schema as any } : undefined,
		onSubmit: async ({ value }) => {
			await onExecute(action, payload, value as Record<string, unknown>, clearSelection);
			if (modal.closeOnSubmit !== false) {
				onOpenChange(false);
			}
		},
	});

	const title = resolveActionValue(modal.title, payload) ?? resolveActionValue(action.label, payload);
	const description = resolveActionValue(modal.description, payload);
	const badge = resolveActionValue(modal.badge, payload);
	const submitText = resolveActionValue(modal.submitText, payload) ?? t("submit");
	const cancelText = resolveActionValue(modal.cancelText, payload) ?? t("cancel");

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			variant={modal.variant ?? "dialog"}
			size={modal.size ?? "md"}
			widthClassName={modal.widthClassName}
			allowFullscreen={modal.allowFullscreen}
			form={form}
			defaultValues={initialValues}
			title={title}
			description={description}
			badge={badge}
			submitText={submitText}
			cancelText={cancelText}
			isSubmitting={isPending}
			enableDirtyGuard={modal.enableDirtyGuard}
		>
			{modal.renderForm ? (
				modal.renderForm({ form, payload, isSubmitting: isPending })
			) : modal.fields?.length ? (
				<SchemaRenderer schema={modal.fields} form={form} />
			) : null}
		</FormDialog>
	);
}

interface ActionContentModalPanelProps<TPayload> {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	action: ActionDef<TPayload, any>;
	payload: TPayload;
	modal: ActionModalConfig<TPayload, any>;
	pendingActionId: string | null;
	onTrigger: (action: ActionDef<any, any>, payload: any) => void;
}

function ActionContentModalPanel<TPayload>({
	open,
	onOpenChange,
	action,
	payload,
	modal,
	pendingActionId,
	onTrigger,
}: ActionContentModalPanelProps<TPayload>) {
	const t = useTranslations("actions");
	const variant = modal.variant ?? "dialog";
	const Footer = variant === "sheet" ? SheetFooter : DialogFooter;

	const title = resolveActionValue(modal.title, payload) ?? resolveActionValue(action.label, payload);
	const description = resolveActionValue(modal.description, payload);
	const closeText = resolveActionValue(modal.closeText, payload) ?? t("close");
	const close = () => onOpenChange(false);
	const contentCtx = { payload, close };

	return (
		<ModalFrame
			open={open}
			onOpenChange={onOpenChange}
			variant={variant}
			size={modal.size ?? "md"}
			widthClassName={modal.widthClassName}
			allowFullscreen={modal.allowFullscreen}
			title={title}
			description={description}
		>
			<div className={DIALOG_BODY_CLASS}>{modal.renderContent?.(contentCtx)}</div>
			<Footer className={DIALOG_FOOTER_CLASS}>
				{modal.footerActions?.length ? (
					<div className="mr-auto flex items-center gap-2">
						{modal.footerActions.map((entry) =>
							entry.kind === "group" ? (
								<ActionGroupView
									key={entry.id}
									group={entry}
									payload={contentCtx}
									surface="inline"
									pendingActionId={pendingActionId}
									onTrigger={onTrigger}
								/>
							) : (
								<ActionTriggerButton
									key={entry.id}
									action={entry}
									payload={contentCtx}
									surface="inline"
									isPending={pendingActionId === entry.id}
									onTrigger={onTrigger}
								/>
							),
						)}
					</div>
				) : null}
				<Button type="button" variant="outline" onClick={close} className="h-8.5 px-4 text-xs font-medium">
					{closeText}
				</Button>
			</Footer>
		</ModalFrame>
	);
}
