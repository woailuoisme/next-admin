import { AlertOctagon, AlertTriangle, CheckCircle2, HelpCircle, Info, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { renderIconSlot, type IconComponentType } from "@/components/shared/renderable";
import { cn } from "cn";

import type { CalloutColor, CalloutProps } from "./types";

export const CALLOUT_DEFAULT_ICONS: Record<CalloutColor, IconComponentType> = {
	primary: Sparkles,
	info: Info,
	success: CheckCircle2,
	warning: AlertTriangle,
	destructive: AlertOctagon,
	neutral: HelpCircle,
};

export const CALLOUT_COLOR_STYLES: Record<
	CalloutColor,
	{
		container: string;
		icon: string;
		title: string;
		actionDefault: string;
	}
> = {
	primary: {
		container: "border-primary/20 bg-primary/5 text-foreground dark:bg-primary/10",
		icon: "text-primary",
		title: "text-primary",
		actionDefault: "bg-primary text-primary-foreground hover:bg-primary/90",
	},
	info: {
		container: "border-chart-1/30 bg-chart-1/10 text-foreground dark:bg-chart-1/15",
		icon: "text-chart-1",
		title: "text-chart-1",
		actionDefault: "border border-chart-1/30 bg-chart-1/15 text-foreground hover:bg-chart-1/25",
	},
	success: {
		container: "border-chart-2/30 bg-chart-2/10 text-foreground dark:bg-chart-2/15",
		icon: "text-chart-2",
		title: "text-chart-2",
		actionDefault: "border border-chart-2/30 bg-chart-2/15 text-foreground hover:bg-chart-2/25",
	},
	warning: {
		container: "border-chart-4/30 bg-chart-4/10 text-foreground dark:bg-chart-4/15",
		icon: "text-chart-4",
		title: "text-chart-4",
		actionDefault: "border border-chart-4/30 bg-chart-4/15 text-foreground hover:bg-chart-4/25",
	},
	destructive: {
		container: "border-destructive/25 bg-destructive/5 text-foreground dark:bg-destructive/10",
		icon: "text-destructive",
		title: "text-destructive",
		actionDefault: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
	},
	neutral: {
		container: "border-border bg-muted/40 text-foreground",
		icon: "text-muted-foreground",
		title: "text-foreground",
		actionDefault: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
	},
};

export function renderCalloutIcon(icon: CalloutProps["icon"], color: CalloutColor, iconClass: string): ReactNode {
	if (icon === false || icon === null) return null;
	if (icon === undefined) {
		return renderIconSlot(CALLOUT_DEFAULT_ICONS[color], cn("size-4 shrink-0", iconClass));
	}
	const rendered = renderIconSlot(icon, cn("size-4 shrink-0", iconClass));
	if (rendered && typeof icon !== "function" && !(typeof icon === "object" && "$$typeof" in (icon as object))) {
		return (
			<span className={cn("inline-flex size-4 shrink-0 items-center justify-center", iconClass)} aria-hidden="true">
				{rendered}
			</span>
		);
	}
	return rendered;
}
