import { ArrowUpDown, FilterX, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { isValidElement, type ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";
import { TableCell, TableRow } from "@/components/ui/table";

import { useOptionalDataTableContext } from "../core/DataTableContext";
import type { DataTableSlots } from "../core/types";
import {
	TableEmptyState,
	type TableEmptyStateConfig,
	type TableEmptyStateContext,
	type TableEmptyStateProps,
} from "../empty-state";

export { DataTableSkeletonRows, type DataTableSkeletonRowsProps } from "./DataTableSkeletonRows";

function useResolvedLoadingText(loadingText?: string) {
	const ctx = useOptionalDataTableContext();
	const t = useTranslations("table");
	return loadingText ?? ctx?.loadingText ?? t("loading_text");
}

export interface DataTableBackdropLoaderProps {
	slots?: DataTableSlots;
	loadingText?: string;
}

export function DataTableBackdropLoader({ slots, loadingText }: DataTableBackdropLoaderProps) {
	const ctx = useOptionalDataTableContext();
	const resolvedLoadingText = useResolvedLoadingText(loadingText);
	if (slots?.loadingOverlay) return <slots.loadingOverlay {...(ctx?.slotProps?.loadingOverlay ?? {})} />;

	return (
		<div
			role="status"
			className="bg-background/55 absolute inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-[1.5px] transition-all duration-200"
			aria-live="polite"
			aria-busy="true"
		>
			<div className="border-border/60 bg-card/95 text-foreground flex items-center gap-3 rounded-xl border px-5 py-3 text-sm font-medium shadow-lg backdrop-blur-md">
				<Spinner aria-hidden="true" className="text-primary size-5" />
				<span>{resolvedLoadingText}</span>
			</div>
		</div>
	);
}

export interface DataTableLoadingOverlayProps {
	colSpan: number;
	slots?: DataTableSlots;
	loadingText?: string;
}

export function DataTableLoadingOverlay({ colSpan, slots, loadingText }: DataTableLoadingOverlayProps) {
	const ctx = useOptionalDataTableContext();
	const resolvedLoadingText = useResolvedLoadingText(loadingText);
	return (
		<TableRow>
			<TableCell colSpan={colSpan} className="h-64 text-center">
				{slots?.loadingOverlay ? (
					<slots.loadingOverlay {...(ctx?.slotProps?.loadingOverlay ?? {})} />
				) : (
					<div className="text-muted-foreground flex flex-col items-center justify-center gap-3" role="status">
						<Spinner aria-hidden="true" className="text-primary size-8" />
						<span className="text-xs font-medium tracking-wide">{resolvedLoadingText}</span>
					</div>
				)}
			</TableCell>
		</TableRow>
	);
}

export interface DataTableEmptyOverlayProps {
	colSpan: number;
	emptyMessage?: string;
	noResultsMessage?: string;
	resetFiltersText?: string;
	isFiltered?: boolean;
	onResetFilters?: () => void;
	emptyState?: ReactNode | TableEmptyStateConfig | ((context: TableEmptyStateContext) => ReactNode);
}

export function DataTableEmptyOverlay({
	colSpan,
	emptyMessage,
	noResultsMessage,
	resetFiltersText,
	isFiltered = false,
	onResetFilters,
	emptyState,
}: DataTableEmptyOverlayProps) {
	const ctx = useOptionalDataTableContext();
	const t = useTranslations("table");

	const resolvedEmptyMessage = emptyMessage ?? ctx?.emptyMessage ?? t("empty_heading");
	const resolvedNoResultsMessage = noResultsMessage ?? ctx?.noResultsMessage ?? t("no_results_heading");
	const resolvedResetFiltersText = resetFiltersText ?? ctx?.resetFiltersText ?? t("reset_filters_action");

	let content: ReactNode = null;
	const emptyStateContext: TableEmptyStateContext = {
		isFiltered,
		resetFilters: onResetFilters,
		onResetFilters,
		resetFiltersText: resolvedResetFiltersText,
	};

	const resetActions: TableEmptyStateProps["actions"] =
		isFiltered && onResetFilters
			? [{ label: resolvedResetFiltersText, icon: RotateCcw, onClick: onResetFilters, variant: "outline" as const }]
			: undefined;

	if (typeof emptyState === "function") {
		content = emptyState(emptyStateContext);
	} else if (isValidElement(emptyState)) {
		content = emptyState;
	} else {
		const baseConfig: TableEmptyStateConfig =
			typeof emptyState === "object" && emptyState !== null ? (emptyState as TableEmptyStateConfig) : {};
		const config = isFiltered && baseConfig.filtered ? { ...baseConfig, ...baseConfig.filtered } : baseConfig;

		content = (
			<TableEmptyState
				icon={config.icon ?? (isFiltered ? FilterX : ArrowUpDown)}
				iconColor={config.iconColor ?? (isFiltered ? "warning" : "muted")}
				heading={config.heading ?? (isFiltered ? resolvedNoResultsMessage : resolvedEmptyMessage)}
				description={config.description ?? (isFiltered ? t("no_results_description") : t("empty_description"))}
				actions={config.actions ?? resetActions}
				renderActions={config.renderActions}
				size={config.size ?? "md"}
				className={config.className}
			/>
		);
	}

	return (
		<TableRow>
			<TableCell colSpan={colSpan} className="h-64 text-center">
				{content}
			</TableCell>
		</TableRow>
	);
}
