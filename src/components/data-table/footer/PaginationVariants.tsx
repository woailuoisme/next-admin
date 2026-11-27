import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "cn";

interface PaginationControlsProps {
	page: number;
	totalPages: number;
	pages: (number | "...")[];
	onPageChange: (page: number) => void;
	labels: {
		first: string;
		previous: string;
		next: string;
		last: string;
	};
}

function handleActivationKeyDown(e: React.KeyboardEvent, action: () => void) {
	if (e.key === " " || e.key === "Enter") {
		e.preventDefault();
		action();
	}
}

export function CapsulePagination({ page, totalPages, pages, onPageChange, labels }: PaginationControlsProps) {
	const t = useTranslations("table");

	return (
		<Pagination
			aria-label={t("aria_pagination")}
			className="divide-border/60 border-border/70 bg-background mx-0 inline-flex h-8 w-auto items-center divide-x overflow-hidden rounded-lg border shadow-2xs"
		>
			<PaginationContent className="divide-border/60 h-full gap-0 divide-x">
				{page > 1 ? (
					<PaginationItem>
						<PaginationLink
							role="button"
							tabIndex={0}
							onClick={() => onPageChange(page - 1)}
							onKeyDown={(e) => handleActivationKeyDown(e, () => onPageChange(page - 1))}
							title={labels.previous}
							aria-label={labels.previous}
							className="text-muted-foreground hover:bg-muted/50 hover:text-foreground flex h-full min-w-8 cursor-pointer items-center justify-center rounded-none border-0 px-2 shadow-none"
						>
							<ChevronLeft aria-hidden="true" />
						</PaginationLink>
					</PaginationItem>
				) : null}

				{pages.map((item, idx) =>
					item === "..." ? (
						<PaginationItem key={`ellipsis-${idx}`}>
							<span className="text-muted-foreground flex h-full min-w-8 items-center justify-center px-1 font-mono text-xs select-none">
								...
							</span>
						</PaginationItem>
					) : (
						<PaginationItem key={item}>
							<PaginationLink
								role="button"
								tabIndex={0}
								onClick={() => onPageChange(item)}
								onKeyDown={(e) => handleActivationKeyDown(e, () => onPageChange(item))}
								aria-current={item === page ? "page" : undefined}
								className={cn(
									"flex h-full min-w-8 cursor-pointer items-center justify-center rounded-none border-0 px-2.5 font-mono text-xs shadow-none transition-colors",
									item === page
										? "bg-background font-bold text-primary hover:bg-background hover:text-primary"
										: "font-medium text-foreground hover:bg-muted/50 hover:text-foreground",
								)}
							>
								{item}
							</PaginationLink>
						</PaginationItem>
					),
				)}

				{page < totalPages ? (
					<PaginationItem>
						<PaginationLink
							role="button"
							tabIndex={0}
							onClick={() => onPageChange(page + 1)}
							onKeyDown={(e) => handleActivationKeyDown(e, () => onPageChange(page + 1))}
							title={labels.next}
							aria-label={labels.next}
							className="text-muted-foreground hover:bg-muted/50 hover:text-foreground flex h-full min-w-8 cursor-pointer items-center justify-center rounded-none border-0 px-2 shadow-none"
						>
							<ChevronRight aria-hidden="true" />
						</PaginationLink>
					</PaginationItem>
				) : null}
			</PaginationContent>
		</Pagination>
	);
}

export function ShadcnPagination({ page, totalPages, pages, onPageChange, labels }: PaginationControlsProps) {
	const t = useTranslations("table");

	return (
		<Pagination aria-label={t("aria_pagination")} className="mx-0 w-auto">
			<PaginationContent className="gap-1">
				<PaginationItem>
					<PaginationPrevious
						role="button"
						text={labels.previous}
						aria-disabled={page <= 1 || undefined}
						tabIndex={page <= 1 ? -1 : 0}
						onClick={() => {
							if (page > 1) onPageChange(page - 1);
						}}
						onKeyDown={(e) => handleActivationKeyDown(e, () => page > 1 && onPageChange(page - 1))}
						className={cn("cursor-pointer text-xs", page <= 1 && "pointer-events-none opacity-40")}
					/>
				</PaginationItem>

				{pages.map((item, idx) =>
					item === "..." ? (
						<PaginationItem key={`ellipsis-${idx}`}>
							<PaginationEllipsis />
						</PaginationItem>
					) : (
						<PaginationItem key={item}>
							<PaginationLink
								role="button"
								tabIndex={0}
								isActive={item === page}
								onClick={() => onPageChange(item)}
								onKeyDown={(e) => handleActivationKeyDown(e, () => onPageChange(item))}
								className="cursor-pointer font-mono text-xs"
							>
								{item}
							</PaginationLink>
						</PaginationItem>
					),
				)}

				<PaginationItem>
					<PaginationNext
						role="button"
						text={labels.next}
						aria-disabled={page >= totalPages || undefined}
						tabIndex={page >= totalPages ? -1 : 0}
						onClick={() => {
							if (page < totalPages) onPageChange(page + 1);
						}}
						onKeyDown={(e) => handleActivationKeyDown(e, () => page < totalPages && onPageChange(page + 1))}
						className={cn("cursor-pointer text-xs", page >= totalPages && "pointer-events-none opacity-40")}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}

export function SimplePagination({ page, totalPages, onPageChange, labels }: PaginationControlsProps) {
	return (
		<div className="flex items-center gap-1">
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="text-muted-foreground disabled:opacity-40"
				onClick={() => onPageChange(1)}
				disabled={page <= 1}
				title={labels.first}
				aria-label={labels.first}
			>
				<ChevronsLeft aria-hidden="true" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="text-muted-foreground disabled:opacity-40"
				onClick={() => onPageChange(page - 1)}
				disabled={page <= 1}
				title={labels.previous}
				aria-label={labels.previous}
			>
				<ChevronLeft aria-hidden="true" />
			</Button>
			<span className="px-1.5 font-mono text-xs font-medium">
				{page} / {totalPages}
			</span>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="text-muted-foreground disabled:opacity-40"
				onClick={() => onPageChange(page + 1)}
				disabled={page >= totalPages}
				title={labels.next}
				aria-label={labels.next}
			>
				<ChevronRight aria-hidden="true" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="text-muted-foreground disabled:opacity-40"
				onClick={() => onPageChange(totalPages)}
				disabled={page >= totalPages}
				title={labels.last}
				aria-label={labels.last}
			>
				<ChevronsRight aria-hidden="true" />
			</Button>
		</div>
	);
}
