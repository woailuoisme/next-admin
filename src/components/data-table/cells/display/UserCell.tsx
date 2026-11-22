import { isNil } from "es-toolkit";
import { BadgeCheck, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { type KeyboardEvent } from "react";

import { CopyButton } from "@/components/shared/CopyButton";
import { handleActivationKey } from "@/components/shared/activationKey";
import { cn } from "cn";

import type { UserCellProps } from "./types";

import { TEXT_ALIGN_CLASSES } from "../base";
import { avatarShapeClasses, avatarSizeClasses, AvatarThumb } from "../media/avatar/AvatarThumb";

/** 后端可能直接回传的未指派文案，与界面语言无关 */
const UNASSIGNED_LITERALS = new Set(["Unassigned", "未指派", "待分配"]);

export function UserCell({
	name,
	subtitle,
	avatarSrc,
	avatarUrl,
	fallback,
	avatarFallback,
	shape = "circle",
	size = "sm",
	status,
	autoColor = true,
	verified = false,
	copyableSubtitle = false,
	allowUnassigned = true,
	unassignedText,
	badge,
	align = "left",
	onClick,
	className,
}: UserCellProps) {
	const t = useTranslations("table");
	const resolvedUnassignedText = unassignedText ?? t("unassigned");
	const isExplicitUnassigned =
		allowUnassigned &&
		(isNil(name) || name === "" || name === resolvedUnassignedText || UNASSIGNED_LITERALS.has(String(name)));

	const hasNoInfo = isNil(name) && isNil(subtitle);

	const interactiveProps = onClick
		? {
				role: "button" as const,
				tabIndex: 0,
				onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => handleActivationKey(e, onClick),
			}
		: undefined;

	// 1. Unassigned State
	if (isExplicitUnassigned || (allowUnassigned && hasNoInfo)) {
		return (
			<div
				{...interactiveProps}
				className={cn(
					"group/user-cell flex max-w-full min-w-0 items-center gap-2.5 select-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden",
					TEXT_ALIGN_CLASSES[align],
					onClick && "cursor-pointer hover:opacity-85",
					className,
				)}
				onClick={onClick}
				data-testid="user-cell-unassigned"
			>
				<div
					className={cn(
						"flex shrink-0 items-center justify-center border border-dashed border-muted-foreground/30 bg-muted/20 text-muted-foreground/50",
						avatarSizeClasses[size],
						avatarShapeClasses[shape],
					)}
				>
					<User aria-hidden="true" className="size-3.5 opacity-60" />
				</div>
				<div className="flex min-w-0 flex-col leading-tight">
					<span className="text-muted-foreground/60 truncate text-xs italic">{resolvedUnassignedText}</span>
					{subtitle && <span className="text-muted-foreground/50 mt-0.5 truncate text-[11px]">{subtitle}</span>}
				</div>
			</div>
		);
	}

	if (hasNoInfo) {
		return <span className="text-muted-foreground/40 text-xs italic">-</span>;
	}

	const resolvedSrc = avatarSrc || avatarUrl;
	const resolvedFallback = avatarFallback || fallback;

	return (
		<div
			{...interactiveProps}
			className={cn(
				"group/user-cell flex max-w-full min-w-0 items-center gap-2.5 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden",
				TEXT_ALIGN_CLASSES[align],
				onClick && "cursor-pointer hover:opacity-85",
				className,
			)}
			onClick={onClick}
			data-testid="user-cell"
		>
			<AvatarThumb
				src={resolvedSrc}
				name={name}
				fallback={resolvedFallback}
				size={size}
				shape={shape}
				status={status}
				autoColor={autoColor}
			/>

			<div className="flex min-w-0 flex-col leading-tight">
				<div className="flex min-w-0 items-center gap-1.5">
					{name && (
						<span
							className={cn(
								"truncate text-xs font-medium tracking-tight text-foreground",
								onClick && "group-hover/user-cell:underline",
							)}
						>
							{name}
						</span>
					)}
					{verified && <BadgeCheck className="text-primary size-3.5 shrink-0" aria-label={t("aria_verified")} />}
					{badge}
				</div>
				{subtitle && (
					<div className="group/sub mt-0.5 flex min-w-0 items-center gap-1">
						<span className="text-muted-foreground/80 truncate text-[11px]">{subtitle}</span>
						{copyableSubtitle && typeof subtitle === "string" ? (
							<CopyButton
								text={subtitle}
								className="size-4 p-0 opacity-0 transition-opacity group-hover/user-cell:opacity-100"
							/>
						) : null}
					</div>
				)}
			</div>
		</div>
	);
}
