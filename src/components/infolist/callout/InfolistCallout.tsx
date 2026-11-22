"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { forwardRef, useState } from "react";

import { COL_SPAN_CLASSES } from "@/components/shared/grid";
import { hasRenderableNode } from "@/components/shared/renderable";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

import { CalloutActionButton } from "./CalloutActionButton";
import { CALLOUT_COLOR_STYLES, renderCalloutIcon } from "./calloutStyles";
import type { CalloutProps } from "./types";

export const InfolistCallout = forwardRef<HTMLDivElement, CalloutProps>(function InfolistCallout(
	{
		color = "info",
		title,
		description,
		icon,
		compact = false,
		dismissible = false,
		onDismiss,
		actions,
		colSpan,
		className,
		children,
		...props
	},
	ref,
) {
	const t = useTranslations("infolist");
	const [dismissed, setDismissed] = useState(false);

	if (dismissed) return null;

	const styles = CALLOUT_COLOR_STYLES[color] || CALLOUT_COLOR_STYLES.info;
	const role = color === "destructive" || color === "warning" ? "alert" : "status";

	const handleDismiss = () => {
		setDismissed(true);
		onDismiss?.();
	};

	const iconComponent = renderCalloutIcon(icon, color, styles.icon);
	const showTitle = hasRenderableNode(title);
	const showDescription = hasRenderableNode(description);
	const showChildren = hasRenderableNode(children);

	if (compact) {
		return (
			<div
				ref={ref}
				role={role}
				className={cn(
					"relative flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs transition-colors",
					colSpan ? COL_SPAN_CLASSES[colSpan] : "w-full",
					styles.container,
					className,
				)}
				{...props}
			>
				<div className="flex min-w-0 flex-1 items-center gap-2.5">
					{iconComponent}
					<div className="flex min-w-0 flex-wrap items-center gap-1.5">
						{showTitle && <span className={cn("font-semibold", styles.title)}>{title}</span>}
						{showDescription && <span className="text-muted-foreground">{description}</span>}
						{showChildren ? children : null}
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					{actions?.map((action, idx) => (
						<CalloutActionButton
							key={idx}
							action={action}
							defaultVariant="outline"
							defaultSize="xs"
							className="text-[11px]"
							openExternalLabel={t("open_external")}
						/>
					))}

					{dismissible && (
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							onClick={handleDismiss}
							className="text-muted-foreground hover:text-foreground cursor-pointer"
							aria-label={t("close_alert")}
						>
							<X className="size-3.5" aria-hidden="true" />
						</Button>
					)}
				</div>
			</div>
		);
	}

	return (
		<div
			ref={ref}
			role={role}
			className={cn(
				"relative flex gap-3.5 rounded-xl border p-4 text-sm transition-colors",
				colSpan ? COL_SPAN_CLASSES[colSpan] : "w-full",
				styles.container,
				className,
			)}
			{...props}
		>
			{iconComponent && <div className="mt-0.5 shrink-0">{iconComponent}</div>}

			<div className="min-w-0 flex-1 space-y-1.5">
				{showTitle && <div className={cn("leading-none font-semibold tracking-tight", styles.title)}>{title}</div>}

				{(showDescription || showChildren) && (
					<div className="text-muted-foreground text-xs leading-relaxed break-words">
						{showDescription ? description : null}
						{showChildren ? children : null}
					</div>
				)}

				{actions && actions.length > 0 && (
					<div className="flex flex-wrap items-center gap-2 pt-2">
						{actions.map((action, idx) => (
							<CalloutActionButton
								key={idx}
								action={action}
								defaultVariant="default"
								defaultSize="sm"
								defaultClass={styles.actionDefault}
								className="text-xs"
								openExternalLabel={t("open_external")}
							/>
						))}
					</div>
				)}
			</div>

			{dismissible && (
				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					onClick={handleDismiss}
					className="text-muted-foreground hover:text-foreground absolute top-3 right-3 cursor-pointer"
					aria-label={t("close_alert")}
				>
					<X className="size-4" aria-hidden="true" />
				</Button>
			)}
		</div>
	);
});

InfolistCallout.displayName = "InfolistCallout";
