"use client";

import { useTranslations } from "next-intl";
import type React from "react";

import { ActionList, type ActionEntry } from "@/components/actions";
import { cn } from "cn";

import { type BaseCellProps, JUSTIFY_ALIGN_CLASSES } from "../base";

export interface ActionsCellProps<TData = unknown> extends BaseCellProps {
	row: TData;
	actions: readonly ActionEntry<TData>[];
	/** 最多常驻几个内联按钮，其余自动折叠进入下拉菜单，默认 2 */
	maxInline?: number;
	/** 更多操作按钮无障碍说明，缺省自动使用 table.actions_more 多语言文案 */
	moreActionsLabel?: string;
}

/**
 * 表格操作列单元格（基于统一 ActionList）：
 * 自动阻断行点击冒泡，支持内联图标操作与下拉溢出菜单。
 */
export function ActionsCell<TData = unknown>({
	row,
	actions,
	maxInline = 2,
	align = "center",
	moreActionsLabel,
	className,
}: ActionsCellProps<TData>) {
	const t = useTranslations("table");

	const handleStopPropagation = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	return (
		<div className={cn("flex items-center", JUSTIFY_ALIGN_CLASSES[align], className)} onClick={handleStopPropagation}>
			<ActionList
				actions={actions}
				payload={row}
				surface="cell"
				maxInline={maxInline}
				moreActionsLabel={moreActionsLabel ?? t("actions_more")}
			/>
		</div>
	);
}
