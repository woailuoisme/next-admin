"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface FormActionButtonsProps {
	variant: "overlay" | "page";
	isSubmitting: boolean;
	isSubmitBlocked: boolean;
	cancelText: ReactNode;
	saveAndContinueText: ReactNode;
	submitText: ReactNode;
	showSaveAndContinue: boolean;
	extraActions?: ReactNode;
	onCancel: () => void;
	onSaveAndContinue: () => void;
}

/**
 * Dialog/Drawer 底部栏与 Page 吸底栏共用的提交动作按钮组。
 */
export function FormActionButtons({
	variant,
	isSubmitting,
	isSubmitBlocked,
	cancelText,
	saveAndContinueText,
	submitText,
	showSaveAndContinue,
	extraActions,
	onCancel,
	onSaveAndContinue,
}: FormActionButtonsProps) {
	const cancelBtn = (
		<Button
			type="button"
			variant={variant === "page" ? "ghost" : "outline"}
			onClick={onCancel}
			disabled={isSubmitting}
			className={
				variant === "page"
					? "text-muted-foreground hover:text-foreground h-8.5 px-3.5 text-xs"
					: "h-8.5 px-4 text-xs font-medium"
			}
		>
			{cancelText}
		</Button>
	);

	const actionGroup = (
		<>
			{showSaveAndContinue ? (
				<Button
					type="button"
					variant={variant === "page" ? "outline" : "secondary"}
					onClick={onSaveAndContinue}
					disabled={isSubmitBlocked}
					className="h-8.5 px-4 text-xs font-medium"
				>
					{isSubmitting ? <Loader2 className="mr-2 size-3.5 animate-spin" aria-hidden="true" /> : null}
					{saveAndContinueText}
				</Button>
			) : null}

			<Button type="submit" disabled={isSubmitBlocked} className="h-8.5 px-4 text-xs font-medium shadow-xs">
				{isSubmitting ? <Loader2 className="mr-2 size-3.5 animate-spin" aria-hidden="true" /> : null}
				{submitText}
			</Button>
		</>
	);

	if (variant === "page") {
		return (
			<>
				<div className="flex items-center gap-2">
					{cancelBtn}
					{extraActions}
				</div>
				<div className="flex items-center gap-2.5">{actionGroup}</div>
			</>
		);
	}

	return (
		<>
			{extraActions ? <div className="mr-auto flex items-center gap-2">{extraActions}</div> : null}
			{cancelBtn}
			{actionGroup}
		</>
	);
}
