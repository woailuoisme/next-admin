import { delay } from "es-toolkit";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { badgeCol } from "@/components/data-table/columns/badge";
import { dateCol } from "@/components/data-table/columns/date";
import {
	colorCol,
	iconCol,
	maskedCol,
	progressCol,
	ratingCol,
	sparklineCol,
	userCol,
} from "@/components/data-table/columns/display";
import { checkboxCol, selectCol, textInputCol, toggleCol } from "@/components/data-table/columns/interactive";
import { avatarCol, imageCol } from "@/components/data-table/columns/media";
import { currencyCol, numberCol } from "@/components/data-table/columns/number";
import { textCol } from "@/components/data-table/columns/text";
import type { DataTableColDef } from "@/components/data-table/core";

import { ROLE_OPTIONS, STATUS_VARIANT_MAP } from "./constants";
import { createShowcaseRowActionsCol, MASTER_DETAIL_COLUMNS } from "./masterColumns";
import type { ShowcaseItem } from "./types";

export { MASTER_DETAIL_COLUMNS };

export interface CreateShowcaseColumnsOptions {
	isAllSelected: boolean;
	isSomeSelected: boolean;
	updateItem: (id: string, patch: Partial<ShowcaseItem>) => void;
	removeItem: (id: string) => void;
	setData: Dispatch<SetStateAction<ShowcaseItem[]>>;
}

export function createShowcaseSelectionColumn({
	isAllSelected,
	isSomeSelected,
	updateItem,
	setData,
}: Pick<
	CreateShowcaseColumnsOptions,
	"isAllSelected" | "isSomeSelected" | "updateItem" | "setData"
>): DataTableColDef<ShowcaseItem> {
	return checkboxCol<ShowcaseItem>("isSelected", "", {
		width: 48,
		pinned: "left",
		headerCheckbox: true,
		isAllChecked: isAllSelected,
		isIndeterminate: isSomeSelected,
		onHeaderCheckboxChange: (checked) => {
			setData((prev) => prev.map((item) => ({ ...item, isSelected: checked })));
			toast.info(checked ? "已全选当前所有条目" : "已取消全选");
		},
		onCellChange: (row, nextVal) => {
			updateItem(row.id, { isSelected: nextVal });
			toast.info(`Item ${row.id} selection: ${nextVal ? "Checked" : "Unchecked"}`);
		},
	});
}

export function createShowcaseDataColumns({
	updateItem,
	removeItem,
}: Pick<CreateShowcaseColumnsOptions, "updateItem" | "removeItem">): DataTableColDef<ShowcaseItem>[] {
	return [
		avatarCol<ShowcaseItem>("avatar", "Avatar", {
			width: 70,
			name: (row) => row.title,
			fallback: (row) => row.title.slice(0, 2).toUpperCase(),
			getStatus: (row) => (row.isVerified ? "online" : undefined),
			autoColor: true,
			shape: "rounded",
		}),
		userCol<ShowcaseItem>("author", "Owner (UserCol)", {
			width: 220,
			copyableSubtitle: true,
			allowUnassigned: true,
			autoColor: true,
			onClick: (row) => toast.info(`Selected author ${row.author.name || "未指派"}`),
		}),
		imageCol<ShowcaseItem>("thumbnail", "Thumbnail (ImageCol)", {
			width: 140,
			size: "md",
			shape: "rounded",
			preview: true,
			placeholderType: "product",
			gallery: true,
		}),
		textCol<ShowcaseItem>("title", "Title (TextCol)", {
			width: 280,
			filterable: true,
			copyable: true,
			weight: "medium",
			lineClamp: 1,
			tag: (row) => row.category,
			tagVariant: "outline",
			kbd: "⌘K",
			highlightText: "Gen",
		}),
		textInputCol<ShowcaseItem>("notes", "Notes (TextInputCol)", {
			width: 240,
			placeholder: "编辑备注 (>= 3 字符)...",
			schema: z.string().min(3),
			onCellChange: async (row, nextNotes) => {
				await delay(300);
				updateItem(row.id, { notes: nextNotes });
				toast.success(`Notes saved for ${row.id}`);
			},
		}),
		badgeCol<ShowcaseItem>("status", "Status (BadgeCol)", {
			width: 120,
			variantMap: STATUS_VARIANT_MAP,
			pulse: (row) => row.status === "active",
			density: "compact",
			onBadgeClick: (row, statusVal) => toast.info(`Filter applied for status: ${statusVal} (${row.id})`),
		}),
		badgeCol<ShowcaseItem>("tags", "Tags (Multi-Badge)", { width: 160, maxCount: 2, density: "compact" }),
		ratingCol<ShowcaseItem>("rating", "Rating (RatingCol)", {
			width: 160,
			showScore: true,
			iconType: "star",
			reviewCount: (row) => row.stock * 3 + 12,
		}),
		sparklineCol<ShowcaseItem>("trend", "Trend (SparklineCol)", {
			width: 120,
			variant: "bar",
			interactive: true,
			autoTrendColor: true,
			barWidth: 5,
			barGap: 2,
		}),
		maskedCol<ShowcaseItem>("apiKey", "API Key (MaskedCol)", {
			width: 180,
			maskType: "apiKey",
			allowReveal: true,
			allowCopy: true,
			autoHideDuration: 5,
		}),
		selectCol<ShowcaseItem, "admin" | "editor" | "superadmin" | "viewer">("role", "Role (SelectCol)", {
			width: 140,
			options: ROLE_OPTIONS,
			onCellChange: async (row, nextRole) => {
				await delay(300);
				updateItem(row.id, { role: nextRole });
				toast.success(`Role for ${row.id} changed to ${nextRole}`);
			},
		}),
		colorCol<ShowcaseItem>("color", "Color (ColorCol)", {
			width: 130,
			copyable: true,
			shape: "circle",
			checkerboard: true,
		}),
		toggleCol<ShowcaseItem>("isFeatured", "Featured (ToggleCol)", {
			width: 110,
			onCellChange: async (row, nextFeatured) => {
				await delay(300);
				updateItem(row.id, { isFeatured: nextFeatured });
				toast.success(`${row.title} is now ${nextFeatured ? "Featured" : "Unfeatured"}`);
			},
		}),
		iconCol<ShowcaseItem>("isVerified", "Verified (IconCol)", {
			width: 130,
			size: "sm",
			container: "badge",
			label: (row) => (row.isVerified ? "已核验证书" : "普通未核验"),
		}),
		numberCol<ShowcaseItem>("stock", "Stock (NumberCol)", {
			width: 130,
			suffix: " pcs",
			trend: true,
			delta: (row) => (row.stock % 2 === 0 ? 14.8 : -6.2),
			deltaDescription: "vs 上周",
		}),
		currencyCol<ShowcaseItem>("price", "Price (CurrencyCol)", {
			width: 130,
			currencyCode: "USD",
			delta: (row) => (row.price > 100 ? 8.5 : undefined),
		}),
		progressCol<ShowcaseItem>("completionRate", "Progress (ProgressCol)", {
			width: 160,
			showPercentage: true,
			target: 80,
			targetLabel: "Q3 Target: 80%",
		}),
		dateCol<ShowcaseItem>("publishedAt", "Published (DateCol)", {
			width: 170,
			dualLine: true,
			primaryFormat: "relative",
			showIcon: true,
			overdueAlert: true,
		}),
		createShowcaseRowActionsCol(removeItem),
	];
}

export function createShowcaseColumns(options: CreateShowcaseColumnsOptions): DataTableColDef<ShowcaseItem>[] {
	return [createShowcaseSelectionColumn(options), ...createShowcaseDataColumns(options)];
}
