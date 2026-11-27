import { useTranslations } from "next-intl";
import { CheckSquare2, X } from "lucide-react";
import { type ReactElement, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface DataTableBatchActionBarProps<TData = unknown> {
	selectedRows: TData[];
	onClearSelection: () => void;
	batchActions?: (selectedRows: TData[], clearSelection: () => void) => ReactNode;
}

function DataTableBatchActionBarInner<TData = unknown>({
	selectedRows,
	onClearSelection,
	batchActions,
}: DataTableBatchActionBarProps<TData>) {
	const t = useTranslations("table");

	if (selectedRows.length === 0) return null;

	return (
		<div className="animate-in border-primary/30 bg-background/95 fade-in slide-in-from-bottom-3 fixed bottom-6 left-1/2 z-50 flex w-fit max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-full border px-4 py-2 shadow-2xl backdrop-blur-md">
			<div className="flex items-center gap-2">
				<CheckSquare2 className="text-primary size-4" />
				<span className="text-xs font-semibold">{t("batch_selected", { count: selectedRows.length })}</span>
			</div>

			<Separator orientation="vertical" className="h-4" />

			{batchActions ? (
				<div className="flex items-center gap-2">{batchActions(selectedRows, onClearSelection)}</div>
			) : null}

			<Button
				variant="ghost"
				size="xs"
				onClick={onClearSelection}
				className="text-muted-foreground hover:text-foreground rounded-full"
			>
				<X data-icon="inline-start" />
				<span>{t("batch_deselect")}</span>
			</Button>
		</div>
	);
}

export const DataTableBatchActionBar = DataTableBatchActionBarInner as <TData = unknown>(
	props: DataTableBatchActionBarProps<TData>,
) => ReactElement | null;
