import { Edit, Eye, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { action } from "@/components/actions";
import { actionsCol } from "@/components/data-table/columns/actions";
import { badgeCol } from "@/components/data-table/columns/badge";
import { userCol } from "@/components/data-table/columns/display";
import { currencyCol, numberCol } from "@/components/data-table/columns/number";
import { textCol } from "@/components/data-table/columns/text";
import type { DataTableColDef } from "@/components/data-table/core";

import { STATUS_VARIANT_MAP } from "./constants";
import type { ShowcaseItem } from "./types";

/**
 * 主从（Master-Detail）视图列定义（纯静态，回调只依赖 row）
 */
export const MASTER_DETAIL_COLUMNS: DataTableColDef<ShowcaseItem>[] = [
	textCol<ShowcaseItem>("id", "Item ID", { width: 120, weight: "medium", mono: true }),
	textCol<ShowcaseItem>("title", "Product Title", {
		width: 280,
		weight: "medium",
		tag: (row) => row.category,
		tagVariant: "outline",
	}),
	badgeCol<ShowcaseItem>("status", "Status", {
		width: 110,
		variantMap: STATUS_VARIANT_MAP,
		pulse: (row) => row.status === "active",
		density: "compact",
	}),
	userCol<ShowcaseItem>("author", "Owner", { width: 220, autoColor: true, copyableSubtitle: true }),
	currencyCol<ShowcaseItem>("price", "Price", { width: 110, align: "right" }),
	numberCol<ShowcaseItem>("stock", "Stock", { width: 100, align: "right" }),
	actionsCol<ShowcaseItem>({
		actions: [
			action.custom<ShowcaseItem>({
				id: "quick-view",
				label: "Quick View",
				icon: Eye,
				handler: ({ payload }) => {
					toast.info(`Viewing ${payload.id}: ${payload.title}`);
				},
			}),
		],
	}),
];

export function createShowcaseRowActionsCol(removeItem: (id: string) => void): DataTableColDef<ShowcaseItem> {
	return actionsCol<ShowcaseItem>({
		headerName: "操作",
		width: 140,
		minWidth: 140,
		pinned: "right",
		actions: [
			action.custom<ShowcaseItem>({
				id: "view",
				label: "查看",
				icon: Eye,
				handler: ({ payload }) => toast.info(`Viewing details of ${payload.id}`),
			}),
			action.custom<ShowcaseItem>({
				id: "edit",
				label: "编辑",
				icon: Edit,
				handler: ({ payload }) => toast.info(`Editing ${payload.id}`),
			}),
			action.group(
				[
					action.custom<ShowcaseItem>({
						id: "boost",
						label: "高亮置顶",
						icon: Sparkles,
						handler: ({ payload }) => toast.success(`Boosted ${payload.title}`),
					}),
					action.custom<ShowcaseItem>({
						id: "delete",
						label: "删除条目",
						icon: Trash2,
						color: "destructive",
						separator: true,
						confirm: {
							title: "确认删除该条目？",
							description: (row) => `删除后将从演示列表移除「${row.title}」。`,
						},
						handler: ({ payload }) => removeItem(payload.id),
					}),
				],
				{ id: "showcase-more" },
			),
		],
	});
}
