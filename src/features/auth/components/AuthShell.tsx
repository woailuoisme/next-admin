"use client";

import { AlertCircle } from "lucide-react";
import { type DateTimeFormatOptions, useFormatter, useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";

import { DEFAULT_PASSWORD_REQUIREMENTS } from "@/components/form/security/PasswordStrengthMeter";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeColorPicker } from "@/components/shared/ThemeColorPicker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "cn";

import { PASSWORD_REQUIREMENT_LABEL_KEYS } from "../schemas";

const SHORT_DATE_OPTIONS: DateTimeFormatOptions = {
	year: "numeric",
	month: "short",
	day: "numeric",
};

/** 组装本地化的密码强度校验清单（ResetPasswordForm 与 ProfileSecurityTab 共用） */
export function usePasswordRequirements() {
	const tForm = useTranslations("form");
	return DEFAULT_PASSWORD_REQUIREMENTS.map((requirement, index) => ({
		...requirement,
		label: tForm(PASSWORD_REQUIREMENT_LABEL_KEYS[index]),
	}));
}

/** 使用 next-intl 本地化格式化 ISO 日期，非法日期安全回退原字符串 */
export function useFormatShortDate() {
	const format = useFormatter();
	return (iso: string) => {
		const date = new Date(iso);
		if (Number.isNaN(date.getTime())) return iso;
		return format.dateTime(date, SHORT_DATE_OPTIONS);
	};
}

/**
 * 认证页统一外壳：全屏居中 + 两团主题色柔光背景。
 * 登录、忘记密码、验证码、重置密码共用，避免背景样式逐页复制漂移。
 */
export function AuthShell({ children }: { children: ReactNode }) {
	return (
		<div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
			{/* 顶部右侧系统控制栏：支持多语言切换与暗黑模式/个性化主题选择 */}
			<div className="absolute top-4 right-4 z-20 flex items-center gap-2">
				<LanguageSwitcher />
				<ThemeColorPicker />
			</div>

			<div
				aria-hidden="true"
				className="bg-primary/10 pointer-events-none absolute top-1/2 left-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
			/>
			<div
				aria-hidden="true"
				className="bg-primary/5 pointer-events-none absolute right-1/4 bottom-1/4 size-80 rounded-full blur-3xl"
			/>

			<div className="relative z-10 flex w-full flex-col items-center">{children}</div>
		</div>
	);
}

/** 认证表单统一卡片外观，四个认证页共用同一套描边、阴影与背景模糊 */
export function AuthCard({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div className={cn("flex w-full max-w-md flex-col gap-6", className)}>
			<Card className="border-border/60 shadow-xl backdrop-blur-sm">{children}</Card>
		</div>
	);
}

/** 表单级业务错误提示（成功/过期等提示请直接用 role="status"） */
export function AuthFormError({ message, className }: { message: ReactNode; className?: string }) {
	return (
		<Alert variant="destructive" className={className}>
			<AlertCircle aria-hidden="true" />
			<AlertDescription className="text-xs">{message}</AlertDescription>
		</Alert>
	);
}

/** 认证表单主按钮：统一的 pending 转圈与文案切换 */
export function AuthSubmitButton({
	isPending,
	label,
	pendingLabel,
	className,
	disabled,
	...props
}: Omit<ComponentProps<typeof Button>, "children"> & {
	isPending: boolean;
	label: ReactNode;
	pendingLabel: ReactNode;
}) {
	return (
		<Button
			type="submit"
			className={cn("w-full font-semibold shadow-md", className)}
			{...props}
			disabled={isPending || disabled}
		>
			{isPending ? (
				<>
					<Spinner data-icon="inline-start" role={undefined} aria-hidden="true" />
					{pendingLabel}
				</>
			) : (
				label
			)}
		</Button>
	);
}
