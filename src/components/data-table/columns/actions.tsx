import { useTranslations } from "next-intl";

import type { ActionEntry } from "@/components/actions";

import type { DataTableColDef, DataTableRenderCellParams } from "../core/types";
import type { ActionsColOptions } from "./types";

import { ActionsCell } from "../cells/action/ActionsCell";

function ActionsColHeader({ headerName }: { headerName?: string }) {
	const t = useTranslations("table");
	return <span>{headerName ?? t("actions_column_title")}</span>;
}

function estimateActionSlots<T>(entries: readonly ActionEntry<T>[], maxInline: number): number {
	let inlineCount = 0;
	let hasDropdown = false;

	for (const entry of entries) {
		if (entry.kind === "group" && entry.layout === "dropdown") {
			hasDropdown = true;
		} else if (entry.kind === "action" && inlineCount < maxInline) {
			inlineCount++;
		} else if (entry.kind === "group") {
			inlineCount++;
		} else {
			hasDropdown = true;
		}
	}

	return inlineCount + (hasDropdown ? 1 : 0);
}

/**
 * 操作列构造器 (ActionsColumn)
 * 统一接收基于 action.* 构造的声明式 ActionEntry[] 数组。
 */
export function actionsCol<TData = any>(options: ActionsColOptions<TData>): DataTableColDef<TData> {
	const {
		field = "__actions",
		headerName,
		renderHeader: propRenderHeader,
		actions,
		maxInline = 2,
		moreActionsLabel,
		...colDef
	} = options;

	const totalButtons = estimateActionSlots(actions, maxInline);
	const calculatedWidth = Math.max(70, totalButtons * 36 + 28);
	const resolvedWidth = colDef.width ?? calculatedWidth;
	const resolvedMinWidth = colDef.minWidth ?? calculatedWidth;

	return {
		field,
		type: "actions",
		headerName: headerName ?? "",
		renderHeader: propRenderHeader ?? (() => <ActionsColHeader headerName={headerName} />),
		sortable: false,
		filterable: false,
		align: "center",
		headerAlign: "center",
		pinned: "right",
		...colDef,
		width: resolvedWidth,
		minWidth: resolvedMinWidth,
		renderCell: ({ row }: DataTableRenderCellParams<TData>) => (
			<ActionsCell
				row={row}
				actions={actions}
				maxInline={maxInline}
				moreActionsLabel={moreActionsLabel}
				align={colDef.align || "center"}
			/>
		),
	};
}
