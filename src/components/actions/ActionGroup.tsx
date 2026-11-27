"use client";

import { ChevronDown, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment } from "react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import { ActionTriggerButton } from "./ActionTriggerButton";
import type { ActionDef, ActionEntry, ActionGroupDef, ActionSurface } from "./types";
import { ACTION_COLOR_BUTTON_VARIANT, resolveActionValue } from "./utils";

export interface ActionGroupRendererProps<TPayload = any> {
	group: ActionGroupDef<TPayload>;
	payload: TPayload;
	surface: ActionSurface;
	pendingActionId?: string | null;
	onTrigger: (action: ActionDef<TPayload, any>, payload: TPayload) => void;
	moreActionsLabel?: string;
}

function renderDropdownEntries<TPayload>(
	entries: readonly ActionEntry<TPayload>[],
	payload: TPayload,
	surface: ActionSurface,
	pendingActionId: string | null | undefined,
	onTrigger: (action: ActionDef<TPayload, any>, payload: TPayload) => void,
) {
	return entries.map((entry, idx) => {
		if (entry.kind === "group") {
			const subLabel = resolveActionValue(entry.label, payload);
			return (
				<Fragment key={entry.id}>
					{idx > 0 || entry.separator ? <DropdownMenuSeparator /> : null}
					<DropdownMenuGroup>
						{subLabel ? (
							<DropdownMenuLabel className="text-muted-foreground text-[11px] font-medium">
								{subLabel}
							</DropdownMenuLabel>
						) : null}
						{renderDropdownEntries(entry.actions, payload, surface, pendingActionId, onTrigger)}
					</DropdownMenuGroup>
				</Fragment>
			);
		}

		return (
			<ActionTriggerButton
				key={entry.id}
				action={entry}
				payload={payload}
				surface={surface}
				isPending={pendingActionId === entry.id}
				onTrigger={onTrigger}
				asMenuItem
			/>
		);
	});
}

/**
 * ActionGroupView:
 * 对齐 Filament v5 ActionGroup，支持 dropdown / button-group / inline 三种编排形态与嵌套子组。
 */
export function ActionGroupView<TPayload = any>({
	group,
	payload,
	surface,
	pendingActionId,
	onTrigger,
	moreActionsLabel,
}: ActionGroupRendererProps<TPayload>) {
	const t = useTranslations("actions");
	if (group.actions.length === 0) return null;

	const label = resolveActionValue(group.label, payload);
	const ariaLabel = resolveActionValue(group.ariaLabel, payload);
	const tooltip = resolveActionValue(group.tooltip, payload);
	const disabled = Boolean(resolveActionValue(group.disabled, payload));
	const Icon = group.icon ?? MoreHorizontal;

	const renderGroupItems = () =>
		group.actions.map((entry) =>
			entry.kind === "group" ? (
				<ActionGroupView
					key={entry.id}
					group={entry}
					payload={payload}
					surface={surface}
					pendingActionId={pendingActionId}
					onTrigger={onTrigger}
					moreActionsLabel={moreActionsLabel}
				/>
			) : (
				<ActionTriggerButton
					key={entry.id}
					action={entry}
					payload={payload}
					surface={surface}
					isPending={pendingActionId === entry.id}
					onTrigger={onTrigger}
				/>
			),
		);

	if (group.layout === "button-group") {
		return <ButtonGroup>{renderGroupItems()}</ButtonGroup>;
	}

	if (group.layout === "inline") {
		return <div className="flex items-center gap-1.5">{renderGroupItems()}</div>;
	}

	const isIconTrigger = !label;
	const triggerVariant =
		group.variant ??
		(surface === "cell" && isIconTrigger ? "ghost" : ACTION_COLOR_BUTTON_VARIANT[group.color ?? "default"]);
	const triggerSize = group.size ?? (isIconTrigger ? (surface === "cell" ? "icon-sm" : "icon") : "sm");
	const accessibleName =
		ariaLabel ?? (typeof label === "string" && label.trim() ? label : (moreActionsLabel ?? t("more_actions")));

	const triggerButton = (
		<DropdownMenuTrigger asChild>
			<Button
				type="button"
				variant={triggerVariant}
				size={triggerSize}
				disabled={disabled}
				aria-label={isIconTrigger ? accessibleName : ariaLabel}
				className={cn(
					isIconTrigger
						? "text-muted-foreground hover:text-foreground cursor-pointer"
						: surface === "batch"
							? "h-7 rounded-full px-3 text-xs"
							: "h-8.5 text-xs shadow-xs",
				)}
			>
				<Icon data-icon={isIconTrigger ? undefined : "inline-start"} aria-hidden="true" />
				{label ? label : <span className="sr-only">{accessibleName}</span>}
				{label ? <ChevronDown data-icon="inline-end" className="opacity-70" aria-hidden="true" /> : null}
			</Button>
		</DropdownMenuTrigger>
	);

	return (
		<DropdownMenu>
			{tooltip ? (
				<Tooltip>
					<TooltipTrigger asChild>{triggerButton}</TooltipTrigger>
					<TooltipContent side="top" className="text-xs">
						{tooltip}
					</TooltipContent>
				</Tooltip>
			) : (
				triggerButton
			)}
			<DropdownMenuContent align="end" className={cn("min-w-40", group.dropdownWidth)}>
				<DropdownMenuGroup>
					{renderDropdownEntries(group.actions, payload, surface, pendingActionId, onTrigger)}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
