"use client";

import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAccessControl } from "@/lib/resource";
import { cn } from "cn";

import { ActionGroupView } from "./ActionGroup";
import { ActionModalHost } from "./ActionModalHost";
import { ActionTriggerButton } from "./ActionTriggerButton";
import type { ActionDef, ActionEntry, ActionGroupDef, ActionSurface } from "./types";
import { useActionRunner } from "./useActionRunner";
import { resolveVisibleActions } from "./utils";

export interface ActionListProps<TPayload = void> {
	actions: readonly ActionEntry<TPayload>[];
	payload?: TPayload;
	surface?: ActionSurface;
	/** cell 模式下最多保留几个内联按钮，其余自动折叠至更多下拉菜单 */
	maxInline?: number;
	moreActionsLabel?: string;
	resourceName?: string;
	clearSelection?: () => void;
	className?: string;
}

/**
 * 统一动作列表渲染容器：
 * 自带 RBAC 权限过滤、条件显隐、空分组折叠、cell 溢出收口与内置弹窗执行宿主。
 */
export function ActionList<TPayload = void>({
	actions,
	payload,
	surface = "toolbar",
	maxInline = 2,
	moreActionsLabel,
	resourceName,
	clearSelection,
	className,
}: ActionListProps<TPayload>) {
	const t = useTranslations("actions");
	const { can } = useAccessControl();
	const runner = useActionRunner<TPayload>();

	const resolvedPayload = payload as TPayload;
	const effectiveResourceName = resourceName ?? runner.resourceBridge?.resource.name;
	const visibleEntries = resolveVisibleActions(actions, resolvedPayload, can, effectiveResourceName);

	const handleTrigger = (action: ActionDef<TPayload, any>, targetPayload: TPayload) => {
		runner.triggerAction(action, targetPayload, { clearSelection });
	};

	if (visibleEntries.length === 0) {
		return null;
	}

	let renderEntries: ActionEntry<TPayload>[] = visibleEntries;

	if (surface === "cell") {
		const inlineList: ActionEntry<TPayload>[] = [];
		const overflowList: ActionEntry<TPayload>[] = [];

		for (const entry of visibleEntries) {
			if (entry.kind === "group" && entry.layout === "dropdown") {
				overflowList.push(...entry.actions);
			} else if (entry.kind === "action" && inlineList.length < maxInline) {
				inlineList.push(entry);
			} else if (entry.kind === "group") {
				inlineList.push(entry);
			} else {
				overflowList.push(entry);
			}
		}

		renderEntries = [...inlineList];
		if (overflowList.length > 0) {
			const overflowGroup: ActionGroupDef<TPayload> = {
				kind: "group",
				id: "__cell_overflow",
				layout: "dropdown",
				icon: MoreHorizontal,
				ariaLabel: moreActionsLabel ?? t("more_actions"),
				actions: overflowList,
			};
			renderEntries.push(overflowGroup);
		}
	}

	return (
		<>
			<div className={cn("flex flex-wrap items-center gap-1.5", surface === "cell" && "flex-nowrap gap-1", className)}>
				{renderEntries.map((entry) =>
					entry.kind === "group" ? (
						<ActionGroupView
							key={entry.id}
							group={entry}
							payload={resolvedPayload}
							surface={surface}
							pendingActionId={runner.pendingActionId}
							onTrigger={handleTrigger}
							moreActionsLabel={moreActionsLabel}
						/>
					) : (
						<ActionTriggerButton
							key={entry.id}
							action={entry}
							payload={resolvedPayload}
							surface={surface}
							isPending={runner.pendingActionId === entry.id}
							onTrigger={handleTrigger}
						/>
					),
				)}
			</div>

			<ActionModalHost
				session={runner.activeSession}
				pendingActionId={runner.pendingActionId}
				resourceBridge={runner.resourceBridge}
				onClose={runner.closeSession}
				onExecute={runner.executeAction}
				onTrigger={handleTrigger}
			/>
		</>
	);
}

export interface ActionButtonProps<TPayload = void> {
	action: ActionDef<TPayload, any>;
	payload?: TPayload;
	surface?: ActionSurface;
	resourceName?: string;
	clearSelection?: () => void;
	className?: string;
}

/**
 * 独立单动作触发按钮组件（开箱自带确认框、表单弹窗、SlideOver 与权限判定）
 */
export function ActionButton<TPayload = void>({
	action,
	payload,
	surface = "inline",
	resourceName,
	clearSelection,
	className,
}: ActionButtonProps<TPayload>) {
	return (
		<ActionList
			actions={[action]}
			payload={payload}
			surface={surface}
			resourceName={resourceName}
			clearSelection={clearSelection}
			className={className}
		/>
	);
}
