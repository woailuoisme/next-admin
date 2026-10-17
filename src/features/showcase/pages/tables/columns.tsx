import type { Dispatch, SetStateAction } from "react";
import { delay } from "es-toolkit";
import { Edit, Eye, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import {
  actionsCol,
  avatarCol,
  badgeCol,
  checkboxCol,
  colorCol,
  currencyCol,
  type DataTableColDef,
  dateCol,
  iconCol,
  imageCol,
  maskedCol,
  numberCol,
  progressCol,
  ratingCol,
  selectCol,
  sparklineCol,
  textCol,
  textInputCol,
  toggleCol,
  userCol,
} from "@/components/data-table";

import { ROLE_OPTIONS, STATUS_VARIANT_MAP } from "./constants";
import type { ShowcaseItem } from "./types";

/**
 * 主从（Master-Detail）视图列定义（纯静态，回调只依赖 row）
 */
export const MASTER_DETAIL_COLUMNS: DataTableColDef<ShowcaseItem>[] = [
  textCol<ShowcaseItem>("id", "Item ID", {
    width: 120,
    weight: "medium",
    mono: true,
  }),
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
  userCol<ShowcaseItem>("author", "Owner", {
    width: 220,
    autoColor: true,
    copyableSubtitle: true,
  }),
  currencyCol<ShowcaseItem>("price", "Price", {
    width: 110,
    align: "right",
  }),
  numberCol<ShowcaseItem>("stock", "Stock", {
    width: 100,
    align: "right",
  }),
  actionsCol<ShowcaseItem>({
    quickActions: [
      {
        label: "Quick View",
        icon: Eye,
        onClick: (row: ShowcaseItem) => toast.info(`Viewing ${row.id}: ${row.title}`),
      },
    ],
  }),
];

export interface CreateShowcaseColumnsOptions {
  isAllSelected: boolean;
  isSomeSelected: boolean;
  updateItem: (id: string, patch: Partial<ShowcaseItem>) => void;
  removeItem: (id: string) => void;
  setData: Dispatch<SetStateAction<ShowcaseItem[]>>;
}

export function createShowcaseColumns({
  isAllSelected,
  isSomeSelected,
  updateItem,
  removeItem,
  setData,
}: CreateShowcaseColumnsOptions): DataTableColDef<ShowcaseItem>[] {
  return [
    checkboxCol<ShowcaseItem>("isSelected", "", {
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
    }),
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
    badgeCol<ShowcaseItem>("tags", "Tags (Multi-Badge)", {
      width: 160,
      maxCount: 2,
      density: "compact",
    }),
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
    actionsCol<ShowcaseItem>({
      headerName: "操作",
      width: 140,
      minWidth: 140,
      pinned: "right",
      quickActions: [
        {
          label: "查看",
          icon: Eye,
          onClick: (row) => toast.info(`Viewing details of ${row.id}`),
        },
        {
          label: "编辑",
          icon: Edit,
          onClick: (row) => toast.info(`Editing ${row.id}`),
        },
      ],
      dropdownActions: [
        {
          label: "高亮置顶",
          icon: Sparkles,
          onClick: (row) => toast.success(`Boosted ${row.title}`),
        },
        {
          label: "删除条目",
          icon: Trash2,
          destructive: true,
          separator: true,
          onClick: (row) => removeItem(row.id),
        },
      ],
    }),
  ];
}
