import { useTranslations } from "next-intl";
import { clamp } from "es-toolkit";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "cn";

import { DEFAULT_PAGE_SIZE_OPTIONS } from "../core/constants";
import type { DataTablePaginationModel } from "../core/types";
import { CapsulePagination, ShadcnPagination, SimplePagination } from "./PaginationVariants";

export interface DataTablePaginationProps {
	paginationModel: DataTablePaginationModel;
	onPaginationModelChange: (model: DataTablePaginationModel) => void;
	rowCount: number;
	pageSizeOptions?: readonly number[];
	variant?: "capsule" | "shadcn" | "simple";
	className?: string;
	renderSummary?: (info: { from: number; to: number; total: number }) => React.ReactNode;
}

function getPaginationPages(currentPage: number, totalPages: number): (number | "...")[] {
	if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
	if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages - 1, totalPages];
	if (currentPage >= totalPages - 2) return [1, 2, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
	return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export function DataTablePagination({
	paginationModel,
	onPaginationModelChange,
	rowCount,
	pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
	variant = "capsule",
	className,
	renderSummary,
}: DataTablePaginationProps) {
	const t = useTranslations("table");
	const { page: rawPage, pageSize } = paginationModel;
	const totalPages = Math.max(1, Math.ceil(rowCount / pageSize));
	const page = Math.min(Math.max(1, rawPage), totalPages);
	const from = rowCount === 0 ? 0 : (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, rowCount);

	const handlePageChange = (newPage: number) => {
		onPaginationModelChange({ page: clamp(newPage, 1, totalPages), pageSize });
	};
	const handlePageSizeChange = (newSize: number) => {
		onPaginationModelChange({ page: 1, pageSize: newSize });
	};

	const pages = getPaginationPages(page, totalPages);
	const mergedPageSizeOptions =
		pageSize && !pageSizeOptions.includes(pageSize)
			? [pageSize, ...pageSizeOptions].sort((a, b) => a - b)
			: pageSizeOptions;

	const labels = {
		first: t("pagination_first"),
		previous: t("pagination_previous"),
		next: t("pagination_next"),
		last: t("pagination_last"),
	};

	return (
		<div
			className={cn(
				"flex flex-wrap items-center justify-between gap-4 border-t border-border/50 bg-card/30 px-3.5 py-2",
				className,
			)}
		>
			<div className="text-muted-foreground text-xs select-none">
				{renderSummary
					? renderSummary({ from, to, total: rowCount })
					: t("pagination_summary", { from, to, total: rowCount })}
			</div>

			<div className="divide-border/60 border-primary/80 bg-background focus-within:border-primary focus-within:ring-primary/20 hover:border-primary inline-flex h-8 items-center divide-x overflow-hidden rounded-lg border text-xs shadow-2xs transition-colors focus-within:ring-2">
				<span className="text-foreground flex h-full items-center px-2.5 font-medium select-none">
					{t("pagination_page_size_prefix")}
				</span>
				<Select value={String(pageSize)} onValueChange={(val) => handlePageSizeChange(Number(val))}>
					<SelectTrigger
						aria-label={t("aria_page_size")}
						className="h-8 min-w-12 rounded-none border-0 bg-transparent py-0 pr-2 pl-2.5 font-mono text-xs shadow-none hover:bg-transparent focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent"
					>
						<SelectValue placeholder={String(pageSize)}>{pageSize}</SelectValue>
					</SelectTrigger>
					<SelectContent side="top">
						{mergedPageSizeOptions.map((opt) => (
							<SelectItem key={opt} value={String(opt)} className="font-mono text-xs">
								{opt}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center">
				{variant === "capsule" && (
					<CapsulePagination
						page={page}
						totalPages={totalPages}
						pages={pages}
						onPageChange={handlePageChange}
						labels={labels}
					/>
				)}
				{variant === "shadcn" && (
					<ShadcnPagination
						page={page}
						totalPages={totalPages}
						pages={pages}
						onPageChange={handlePageChange}
						labels={labels}
					/>
				)}
				{variant === "simple" && (
					<SimplePagination
						page={page}
						totalPages={totalPages}
						pages={pages}
						onPageChange={handlePageChange}
						labels={labels}
					/>
				)}
			</div>
		</div>
	);
}
