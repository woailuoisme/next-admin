"use client";

import { useMemoizedFn, useUnmountedRef } from "ahooks";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentType, type ReactNode, useId, useRef, useState } from "react";

import type { ActionColor } from "@/components/actions/types";
import { ACTION_CONFIRM_BADGE_CLASSES } from "@/components/actions/utils";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "cn";

export interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title?: ReactNode;
	description?: ReactNode;
	confirmText?: ReactNode;
	cancelText?: ReactNode;
	color?: ActionColor;
	icon?: ComponentType<{ className?: string }>;
	confirmIcon?: ComponentType<{ className?: string }>;
	requireConfirmKeyword?: boolean | string;
	confirmKeyword?: string;
	autoFocusInput?: boolean;
	isPending?: boolean;
	onConfirm: () => void | Promise<void>;
	className?: string;
}

interface ConfirmDialogPanelProps extends ConfirmDialogProps {
	internalPending: boolean;
	onInternalPendingChange: (pending: boolean) => void;
}

function ConfirmDialogPanel({
	onOpenChange,
	title,
	description,
	confirmText,
	cancelText,
	color = "destructive",
	icon: HeaderIcon = AlertTriangle,
	confirmIcon: ConfirmIcon,
	requireConfirmKeyword,
	confirmKeyword,
	autoFocusInput = false,
	isPending = false,
	internalPending,
	onInternalPendingChange,
	onConfirm,
	className,
}: ConfirmDialogPanelProps) {
	const tDialog = useTranslations("dialog");
	const tActions = useTranslations("actions");
	const keywordInputId = useId();
	const [confirmInput, setConfirmInput] = useState("");
	const unmountedRef = useUnmountedRef();
	const confirmLockRef = useRef(false);

	const isActionPending = isPending || internalPending;
	const targetKeyword =
		typeof requireConfirmKeyword === "string" ? requireConfirmKeyword : (confirmKeyword ?? tDialog("delete_keyword"));
	const hasKeywordRequirement = Boolean(requireConfirmKeyword);
	const isKeywordMatched = hasKeywordRequirement
		? confirmInput.trim().toUpperCase() === targetKeyword.trim().toUpperCase()
		: true;

	const tone = ACTION_CONFIRM_BADGE_CLASSES[color] ?? ACTION_CONFIRM_BADGE_CLASSES.destructive;
	const resolvedTitle = title ?? tActions("confirm_title");
	const resolvedDescription = description ?? tActions("confirm_description");
	const resolvedConfirmText = confirmText ?? tActions("confirm_button");
	const resolvedCancelText = cancelText ?? tActions("cancel");

	const handleConfirm = useMemoizedFn(async () => {
		if (confirmLockRef.current || isActionPending || !isKeywordMatched) return;
		confirmLockRef.current = true;
		try {
			onInternalPendingChange(true);
			await onConfirm();
			if (!unmountedRef.current) {
				onOpenChange(false);
			}
		} finally {
			confirmLockRef.current = false;
			if (!unmountedRef.current) {
				onInternalPendingChange(false);
			}
		}
	});

	return (
		<AlertDialogContent className={cn("max-w-md sm:max-w-md", className)}>
			<AlertDialogHeader className="gap-2">
				<div className="flex items-center gap-2.5">
					<div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", tone.wrapper)}>
						<HeaderIcon className={cn("size-4", tone.icon)} aria-hidden="true" />
					</div>
					<AlertDialogTitle className="text-foreground text-base font-semibold">{resolvedTitle}</AlertDialogTitle>
				</div>

				{resolvedDescription ? (
					<AlertDialogDescription className="text-muted-foreground text-xs leading-relaxed">
						{resolvedDescription}
					</AlertDialogDescription>
				) : null}
			</AlertDialogHeader>

			{hasKeywordRequirement ? (
				<div className="flex flex-col gap-1.5 pt-1 pb-2">
					<Label htmlFor={keywordInputId} className="text-muted-foreground text-xs">
						{tDialog("delete_keyword_prompt", { keyword: targetKeyword })}
					</Label>
					<Input
						id={keywordInputId}
						value={confirmInput}
						onChange={(e) => setConfirmInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && isKeywordMatched && !isActionPending) {
								e.preventDefault();
								void handleConfirm();
							}
						}}
						placeholder={tDialog("delete_keyword_placeholder", { keyword: targetKeyword })}
						disabled={isActionPending}
						className="h-8 font-mono text-xs"
						autoFocus={autoFocusInput}
					/>
				</div>
			) : null}

			<AlertDialogFooter className="gap-2 sm:gap-2">
				<AlertDialogCancel disabled={isActionPending} onClick={() => onOpenChange(false)} className="h-9 text-xs">
					{resolvedCancelText}
				</AlertDialogCancel>
				<AlertDialogAction
					onClick={(e) => {
						e.preventDefault();
						void handleConfirm();
					}}
					disabled={isActionPending || !isKeywordMatched}
					className={cn("h-9 gap-1.5 text-xs disabled:opacity-50", tone.button)}
				>
					{isActionPending ? (
						<Spinner data-icon="inline-start" role={undefined} aria-hidden="true" />
					) : ConfirmIcon ? (
						<ConfirmIcon data-icon="inline-start" aria-hidden="true" />
					) : null}
					{resolvedConfirmText}
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	);
}

/**
 * ConfirmDialog:
 * 统一通用二次确认弹窗（支持危险/警示/主色/常规语义、防连击锁、卸载守卫与关键词核验）。
 */
export function ConfirmDialog(props: ConfirmDialogProps) {
	const { open, onOpenChange, isPending } = props;
	const [internalPending, setInternalPending] = useState(false);

	const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
		if (isPending || internalPending) return;
		onOpenChange(nextOpen);
	});

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			{open ? (
				<ConfirmDialogPanel {...props} internalPending={internalPending} onInternalPendingChange={setInternalPending} />
			) : null}
		</AlertDialog>
	);
}
