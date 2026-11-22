"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "cn";

import { KeyValueRow } from "./KeyValueRow";
import type { KeyValueRowItem } from "./types";

interface KeyValueTableProps {
	rows: KeyValueRowItem[];
	hasError?: boolean;
	isEditable: boolean;
	reorderable: boolean;
	canDelete: boolean;
	canEditKeys: boolean;
	masked: boolean;
	minItems: number;
	isAddAllowed: boolean;
	disabled?: boolean;
	readOnly?: boolean;
	keyLabel?: ReactNode;
	valueLabel?: ReactNode;
	keyPlaceholder: string;
	valuePlaceholder: string;
	keySuggestions?: string[];
	emptyText?: string;
	addButtonText: string;
	onKeyChange: (rowId: string, nextKey: string) => void;
	onValueChange: (rowId: string, nextVal: string) => void;
	onRemove: (rowId: string) => void;
	onAdd: () => void;
}

export function KeyValueTable({
	rows,
	hasError,
	isEditable,
	reorderable,
	canDelete,
	canEditKeys,
	masked,
	minItems,
	isAddAllowed,
	disabled,
	readOnly,
	keyLabel,
	valueLabel,
	keyPlaceholder,
	valuePlaceholder,
	keySuggestions,
	emptyText,
	addButtonText,
	onKeyChange,
	onValueChange,
	onRemove,
	onAdd,
}: KeyValueTableProps) {
	const t = useTranslations("form");
	const tableColCount = 2 + (reorderable && isEditable ? 1 : 0) + (canDelete && isEditable ? 1 : 0);

	return (
		<div
			className={cn(
				"border-border/80 bg-card overflow-hidden rounded-lg border shadow-2xs",
				hasError && "border-destructive",
			)}
		>
			<Table className="text-xs">
				<TableHeader>
					<TableRow className="border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted/40 border-b font-medium select-none">
						{reorderable && isEditable ? (
							<TableHead className="border-border/60 w-8 border-r px-2 py-2 text-center" />
						) : null}
						<TableHead className="border-border/60 text-muted-foreground border-r px-3 py-2 text-left font-medium">
							{keyLabel || t("keyvalue_key_label")}
						</TableHead>
						<TableHead
							className="text-muted-foreground px-3 py-2 text-left font-medium"
							colSpan={canDelete && isEditable ? 2 : 1}
						>
							{valueLabel || t("keyvalue_value_label")}
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody className="divide-border/40 divide-y">
					{rows.length === 0 && emptyText ? (
						<TableRow>
							<TableCell colSpan={tableColCount} className="text-muted-foreground py-6 text-center text-xs">
								{emptyText}
							</TableCell>
						</TableRow>
					) : (
						rows.map((row) => (
							<KeyValueRow
								key={row._id}
								row={row}
								keyPlaceholder={keyPlaceholder}
								valuePlaceholder={valuePlaceholder}
								keySuggestions={keySuggestions}
								disabled={disabled}
								readOnly={readOnly}
								canEditKeys={canEditKeys}
								canDelete={canDelete && rows.length > minItems}
								reorderable={reorderable}
								masked={masked}
								onKeyChange={onKeyChange}
								onValueChange={onValueChange}
								onRemove={onRemove}
							/>
						))
					)}
				</TableBody>
			</Table>

			{isAddAllowed ? (
				<Button
					type="button"
					variant="ghost"
					onClick={onAdd}
					className="border-border/60 bg-card text-foreground hover:bg-muted/40 active:bg-muted/60 h-9 w-full rounded-none border-t px-3 text-xs font-medium"
				>
					<Plus aria-hidden="true" className="text-muted-foreground size-3.5" />
					<span>{addButtonText}</span>
				</Button>
			) : null}
		</div>
	);
}
