"use client";

import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import { forwardRef, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "cn";

import type { DataTableFilterLayout } from "../../core/types";

const POPOVER_WIDTH_CLASSES: Record<number, string> = {
	1: "w-80 sm:w-96",
	2: "w-[90vw] sm:w-[520px] md:w-[580px]",
	3: "w-[90vw] sm:w-[640px] md:w-[760px]",
	4: "w-[95vw] sm:w-[760px] md:w-[900px]",
};

interface FilterTriggerButtonProps extends React.ComponentProps<typeof Button> {
	activeCount?: number;
}

const FilterTriggerButton = forwardRef<HTMLButtonElement, FilterTriggerButtonProps>(
	({ activeCount = 0, className, ...props }, ref) => {
		const t = useTranslations("table");

		return (
			<Button
				ref={ref}
				variant="outline"
				size="sm"
				className={cn("h-8 text-xs text-muted-foreground hover:text-foreground", className)}
				{...props}
			>
				<Filter aria-hidden="true" data-icon="inline-start" />
				<span>{t("filter_trigger")}</span>
				{activeCount > 0 ? (
					<Badge
						variant="secondary"
						className="bg-primary/15 text-primary flex size-4.5 items-center justify-center rounded-full p-0 font-mono text-[10px] font-semibold"
					>
						{activeCount}
					</Badge>
				) : null}
			</Button>
		);
	},
);
FilterTriggerButton.displayName = "FilterTriggerButton";

export interface FilterLayoutShellProps {
	layout: DataTableFilterLayout;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	activeCount: number;
	showReset: boolean;
	columnsCount: number;
	deferFilters: boolean;
	sheetTitle: string;
	sheetDescription: string;
	onReset: () => void;
	onApply: () => void;
	children: ReactNode;
}

export function FilterLayoutShell({
	layout,
	open,
	onOpenChange,
	activeCount,
	showReset,
	columnsCount,
	deferFilters,
	sheetTitle,
	sheetDescription,
	onReset,
	onApply,
	children,
}: FilterLayoutShellProps) {
	const t = useTranslations("table");

	if (layout === "aboveContent") {
		return <div className="border-border/60 bg-card rounded-xl border p-4 shadow-xs">{children}</div>;
	}

	if (layout === "sheet") {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetTrigger asChild>
					<FilterTriggerButton activeCount={activeCount} />
				</SheetTrigger>
				<SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-md">
					<SheetHeader>
						<div className="flex items-center justify-between pr-6">
							<div className="flex items-center gap-2">
								<SheetTitle className="text-base font-semibold">{sheetTitle}</SheetTitle>
								{activeCount > 0 ? (
									<Badge variant="secondary" className="bg-primary/10 text-primary font-mono text-[10px]">
										{t("filter_active_count", { count: activeCount })}
									</Badge>
								) : null}
							</div>
							{showReset ? (
								<Button
									variant="ghost"
									size="xs"
									onClick={onReset}
									className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
								>
									{t("filter_reset")}
								</Button>
							) : null}
						</div>
						<SheetDescription className="text-muted-foreground text-xs">{sheetDescription}</SheetDescription>
					</SheetHeader>

					<Separator />

					<div className="flex-1 p-4">{open ? children : null}</div>

					<Separator />

					<SheetFooter className="flex flex-row items-center justify-end gap-2">
						<SheetClose asChild>
							<Button variant="outline" size="sm" className="h-8 text-xs">
								{t("filter_close")}
							</Button>
						</SheetClose>
						<Button size="sm" onClick={onApply} className="h-8 px-4 text-xs font-medium">
							{deferFilters ? t("filter_apply") : t("filter_done")}
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<FilterTriggerButton activeCount={activeCount} />
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className={cn(
					"border-border/70 p-4 shadow-xl",
					POPOVER_WIDTH_CLASSES[columnsCount] ?? POPOVER_WIDTH_CLASSES[2],
				)}
			>
				{open ? children : null}
			</PopoverContent>
		</Popover>
	);
}
