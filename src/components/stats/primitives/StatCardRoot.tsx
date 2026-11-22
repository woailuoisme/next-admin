"use client";

import { HelpCircle, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { createContext, type ReactNode, useContext } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import { useStatsGridContext } from "../grid/StatsGridContext";
import { getStatTheme } from "../shared/theme";
import type { SparklineLayout, StatCardTheme, StatDensity } from "../shared/types";
import { DENSITY_STYLES, type StatCardHelpTooltipProps, type StatCardIconProps, type StatCardRootProps } from "./types";

export interface StatCardContextValue {
	density: StatDensity;
	sparklineLayout: SparklineLayout;
	theme: StatCardTheme;
	isInteractive: boolean;
}

export const StatCardContext = createContext<StatCardContextValue>({
	density: "compact",
	sparklineLayout: "inline",
	theme: "primary",
	isInteractive: false,
});

export function useStatCardContext(): StatCardContextValue {
	return useContext(StatCardContext);
}

const STRETCHED_OVERLAY_CLASS =
	"focus-visible:ring-ring rounded-xl after:absolute after:inset-0 after:z-0 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset";

export function StatCardRoot({
	density,
	sparklineLayout,
	theme = "primary",
	to,
	linkLabel,
	onClick,
	onKeyDown,
	className,
	children,
	...props
}: StatCardRootProps) {
	const gridContext = useStatsGridContext();
	const resolvedDensity = density ?? gridContext.density ?? "compact";
	const resolvedSparklineLayout = sparklineLayout ?? gridContext.sparklineLayout ?? "inline";
	const isInteractive = Boolean(to || onClick);
	const dStyles = DENSITY_STYLES[resolvedDensity] ?? DENSITY_STYLES.compact;

	const contextValue: StatCardContextValue = {
		density: resolvedDensity,
		sparklineLayout: resolvedSparklineLayout,
		theme,
		isInteractive,
	};

	return (
		<StatCardContext value={contextValue}>
			<Card
				size={resolvedDensity === "compact" ? "sm" : "default"}
				data-density={resolvedDensity}
				data-sparkline-layout={resolvedSparklineLayout}
				onKeyDown={onKeyDown}
				className={cn(
					"@container relative gap-0 overflow-hidden border-border/60 py-0 transition-all duration-200",
					isInteractive &&
						"group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					className,
				)}
				{...props}
			>
				{to ? (
					<Link href={to} aria-label={linkLabel || undefined} onClick={onClick} className={STRETCHED_OVERLAY_CLASS} />
				) : onClick ? (
					<button
						type="button"
						aria-label={linkLabel || undefined}
						onClick={onClick}
						className={cn("appearance-none border-0 bg-transparent p-0 text-left", STRETCHED_OVERLAY_CLASS)}
					/>
				) : null}
				<CardContent className={cn("flex h-full flex-col justify-between", dStyles.cardPadding, dStyles.headerGap)}>
					{children}
				</CardContent>
			</Card>
		</StatCardContext>
	);
}

export function StatCardHelpTooltip({ description, className }: StatCardHelpTooltipProps) {
	if (!description) return null;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					className={cn(
						"relative z-10 shrink-0 cursor-help text-muted-foreground/60 hover:text-muted-foreground",
						className,
					)}
					aria-label={description}
				>
					<HelpCircle className="size-3.5" aria-hidden="true" />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="top" className="max-w-xs text-xs">
				{description}
			</TooltipContent>
		</Tooltip>
	);
}

export function StatCardIcon({ icon: Icon, theme, density, isInteractive, className, ...props }: StatCardIconProps) {
	const context = useStatCardContext();
	const resolvedTheme = theme ?? context.theme ?? "primary";
	const resolvedDensity = density ?? context.density ?? "compact";
	const resolvedInteractive = isInteractive ?? context.isInteractive;

	if (!Icon) return null;

	const themeConfig = getStatTheme(resolvedTheme);
	const dStyles = DENSITY_STYLES[resolvedDensity] ?? DENSITY_STYLES.compact;

	return (
		<div
			aria-hidden="true"
			className={cn(
				"border transition-transform duration-200",
				resolvedInteractive && "group-hover:scale-105",
				dStyles.iconContainer,
				themeConfig.iconBadge,
				className,
			)}
			{...props}
		>
			<Icon className={dStyles.iconSize} aria-hidden="true" />
		</div>
	);
}

export interface StatCardHeadlineProps {
	title: ReactNode;
	/** 标题旁帮助说明；缺省时不渲染问号 */
	description?: string;
	/** 右侧徽标 */
	badge?: ReactNode;
	/** 右侧操作区（通用 StatCard 专用） */
	actions?: ReactNode;
	/** 右侧自定义尾巴（如 LiveStatCard 的状态胶囊） */
	trailing?: ReactNode;
	/** 右上角图标徽章 */
	icon?: LucideIcon;
	theme?: StatCardTheme;
	density?: StatDensity;
}

/**
 * 四类 StatCard 共用的顶栏：标题 + 帮助提示 | 徽标、操作 / 尾巴、图标
 */
export function StatCardHeadline({
	title,
	description,
	badge,
	actions,
	trailing,
	icon: Icon,
	theme,
	density,
}: StatCardHeadlineProps) {
	const ctx = useStatCardContext();
	const resolvedDensity = density ?? ctx.density;
	const dStyles = DENSITY_STYLES[resolvedDensity] ?? DENSITY_STYLES.compact;

	return (
		<div className="flex items-start justify-between gap-2">
			<div className="flex min-w-0 items-center gap-1.5">
				<span className={cn("truncate font-medium tracking-tight text-muted-foreground", dStyles.titleText)}>
					{title}
				</span>
				{description ? <StatCardHelpTooltip description={description} /> : null}
			</div>

			<div className="flex shrink-0 items-center gap-1.5">
				{badge}
				{actions ? <div className="relative z-10 flex items-center gap-1">{actions}</div> : null}
				{trailing}
				{Icon ? <StatCardIcon icon={Icon} theme={theme} density={resolvedDensity} /> : null}
			</div>
		</div>
	);
}
