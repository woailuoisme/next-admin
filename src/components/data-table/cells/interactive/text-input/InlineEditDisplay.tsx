"use client";

import { Edit2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "cn";

import { TEXT_ALIGN_CLASSES } from "../../base";

interface InlineEditDisplayProps {
	value: string;
	placeholder?: string;
	disabled?: boolean;
	loading?: boolean;
	align?: "left" | "center" | "right";
	className?: string;
	onStartEdit: () => void;
}

export function InlineEditDisplay({
	value,
	placeholder,
	disabled = false,
	loading = false,
	align = "left",
	className,
	onStartEdit,
}: InlineEditDisplayProps) {
	const t = useTranslations("table");
	const resolvedPlaceholder = placeholder ?? t("cell_edit_placeholder");

	return (
		<div
			role={disabled ? undefined : "button"}
			tabIndex={disabled ? -1 : 0}
			aria-label={disabled ? undefined : t("cell_edit_aria", { value: value || resolvedPlaceholder })}
			className={cn(
				"group/cell -mx-1.5 flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-1 transition-colors select-none hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden",
				disabled && "cursor-default opacity-70",
				TEXT_ALIGN_CLASSES[align],
				className,
			)}
			onClick={(e) => {
				e.stopPropagation();
				if (!disabled) onStartEdit();
			}}
			onKeyDown={(e) => {
				if (!disabled && (e.key === "Enter" || e.key === " ")) {
					e.preventDefault();
					e.stopPropagation();
					onStartEdit();
				}
			}}
		>
			<span className={cn("truncate text-xs", !value && "text-muted-foreground/50 italic")}>
				{value || resolvedPlaceholder}
			</span>
			{loading ? (
				<Spinner className="text-muted-foreground size-3 shrink-0" />
			) : !disabled ? (
				<Edit2 className="text-muted-foreground/40 group-hover/cell:text-foreground/70 size-3 shrink-0 opacity-0 transition-colors group-hover/cell:opacity-100" />
			) : null}
		</div>
	);
}
