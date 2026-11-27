"use client";

import { isNil } from "es-toolkit";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { CopyButton } from "@/components/shared/CopyButton";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

import type { MaskedCellProps, MaskType } from "./types";

import { TEXT_ALIGN_CLASSES } from "../base";

export function formatMaskedValue(
	val: string,
	type: MaskType = "custom",
	customMask?: (v: string) => string,
	maskChar?: string,
): string {
	if (!val) return "";
	if (customMask) return customMask(val);

	const star = maskChar ? maskChar.repeat(4) : "****";
	const dotGroup = (count: number) => (maskChar ?? "•").repeat(count);
	const starGroup = (count: number) => (maskChar ?? "*").repeat(count);

	switch (type) {
		case "phone": {
			const clean = val.replace(/\s+/g, "");
			if (clean.length === 11) {
				return `${clean.slice(0, 3)}${star}${clean.slice(-4)}`;
			}
			if (clean.length > 6) {
				return `${clean.slice(0, 3)}${star}${clean.slice(-3)}`;
			}
			return starGroup(6);
		}
		case "email": {
			const [user, domain] = val.split("@");
			if (!domain) return starGroup(6);
			if (!user) {
				return `${maskChar ?? "*"}@${domain}`;
			}
			if (user.length <= 2) {
				return `${user[0]}${maskChar ?? "*"}@${domain}`;
			}
			const visiblePrefix = user.slice(0, 2);
			const visibleSuffix = user.slice(-1);
			return `${visiblePrefix}${star}${visibleSuffix}@${domain}`;
		}
		case "apiKey": {
			if (val.length <= 8) return dotGroup(8);
			const underscoreIdx = val.indexOf("_");
			const prefix = underscoreIdx > 0 && underscoreIdx <= 6 ? val.slice(0, underscoreIdx + 1) : val.slice(0, 4);
			const suffix = val.slice(-4);
			return `${prefix}${dotGroup(8)}${suffix}`;
		}
		case "idCard": {
			if (val.length === 18) {
				return `${val.slice(0, 6)}${starGroup(8)}${val.slice(-4)}`;
			}
			if (val.length > 8) {
				return `${val.slice(0, 4)}${starGroup(8)}${val.slice(-4)}`;
			}
			return starGroup(8);
		}
		case "creditCard": {
			const clean = val.replace(/[\s-]+/g, "");
			if (clean.length >= 12) {
				return `${clean.slice(0, 4)} ${star} ${star} ${clean.slice(-4)}`;
			}
			return `${star} ${star} ${star} ${star}`;
		}
		case "jwt": {
			const parts = val.split(".");
			if (parts.length === 3) {
				return `${parts[0].slice(0, 6)}...${dotGroup(8)}...${parts[2].slice(-6)}`;
			}
			if (val.length > 16) {
				return `${val.slice(0, 6)}${dotGroup(8)}${val.slice(-6)}`;
			}
			return dotGroup(8);
		}
		default: {
			if (val.length <= 4) return dotGroup(4);
			return `${val.slice(0, 2)}${dotGroup(8)}${val.slice(-2)}`;
		}
	}
}

export function MaskedCell({
	value,
	maskType = "custom",
	customMask,
	allowReveal = true,
	autoHideDuration,
	copyable = true,
	allowCopy,
	maskChar,
	mono = true,
	align = "left",
	className,
}: MaskedCellProps) {
	const t = useTranslations("table");
	const [revealed, setRevealed] = useState(false);
	const [remainingSeconds, setRemainingSeconds] = useState(0);

	const isCopyable = allowCopy ?? copyable;

	// 处理自动遮蔽倒计时（避免在 state updater 内嵌套 setState，兼容 StrictMode）
	useEffect(() => {
		if (!revealed || !autoHideDuration || autoHideDuration <= 0) {
			return;
		}

		let current = autoHideDuration;
		const timer = window.setInterval(() => {
			current -= 1;
			if (current <= 0) {
				window.clearInterval(timer);
				setRemainingSeconds(0);
				setRevealed(false);
			} else {
				setRemainingSeconds(current);
			}
		}, 1000);

		return () => window.clearInterval(timer);
	}, [revealed, autoHideDuration]);

	if (isNil(value) || value === "") {
		return <span className="text-muted-foreground/40 text-xs italic">-</span>;
	}

	const stringVal = String(value);
	const displayedText = revealed ? stringVal : formatMaskedValue(stringVal, maskType, customMask, maskChar);

	const handleToggleReveal = () => {
		const next = !revealed;
		setRevealed(next);
		setRemainingSeconds(next && autoHideDuration && autoHideDuration > 0 ? autoHideDuration : 0);
	};

	return (
		<div
			className={cn(
				"group/masked-cell flex items-center gap-1.5 text-xs tracking-tight",
				mono && "font-mono",
				TEXT_ALIGN_CLASSES[align],
				className,
			)}
			data-testid="masked-cell"
		>
			<span className={cn("select-all", !revealed && "text-muted-foreground")}>{displayedText}</span>

			<div className="flex items-center gap-1 opacity-60 transition-opacity group-hover/masked-cell:opacity-100">
				{allowReveal && (
					<div className="flex items-center gap-0.5">
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							className="text-muted-foreground hover:text-foreground"
							onClick={(e) => {
								e.stopPropagation();
								handleToggleReveal();
							}}
							aria-label={revealed ? t("aria_hide_value") : t("aria_reveal_value")}
							title={revealed ? t("aria_hide_value") : t("aria_reveal_value")}
						>
							{revealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
						</Button>

						{revealed && Boolean(autoHideDuration) && remainingSeconds > 0 ? (
							<span
								className="bg-muted text-muted-foreground rounded-xs px-1 font-mono text-[9px]"
								title={t("masked_auto_hide", { seconds: remainingSeconds })}
							>
								{remainingSeconds}s
							</span>
						) : null}
					</div>
				)}

				{isCopyable ? (
					<CopyButton
						text={stringVal}
						className="text-muted-foreground hover:text-foreground size-6"
						title={t("cell_copy_title")}
					/>
				) : null}
			</div>
		</div>
	);
}
