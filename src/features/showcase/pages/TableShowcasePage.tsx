"use client";

import { useMemoizedFn } from "ahooks";
import { delay } from "es-toolkit";
import {
  Archive,
  CheckCircle2,
  Clock,
  Copy,
  Edit,
  Eye,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  actionsCol,
  avatarCol,
  badgeCol,
  checkboxCol,
  colorCol,
  currencyCol,
  DataTable,
  type DataTableColDef,
  type DataTableFilterDefinition,
  type DataTableFilterLayout,
  type DataTableSavedView,
  type DataTableTabItem,
  dateCol,
  iconCol,
  imageCol,
  maskedCol,
  numberCol,
  progressCol,
  ratingCol,
  type SelectCellOption,
  selectCol,
  sparklineCol,
  TableEmptyState,
  textCol,
  textInputCol,
  toggleCol,
  userCol,
} from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { TanStackDbShowcase } from "../components/TanStackDbShowcase";

export interface ShowcaseItem {
  id: string;
  title: string;
  category: string;
  status: "active" | "draft" | "archived";
  avatar: string;
  thumbnail: string | string[];
  color: string;
  isFeatured: boolean;
  isVerified: boolean;
  publishedAt: string;
  stock: number;
  price: number;
  completionRate: number;
  role: "admin" | "editor" | "superadmin" | "viewer";
  isSelected: boolean;
  notes: string;
  author: {
    name?: string;
    avatarUrl?: string;
    subtitle?: string;
    status?: "online" | "offline" | "busy" | "away";
    verified?: boolean;
  };
  rating: number;
  trend: number[];
  apiKey: string;
  tags: string[];
}

const STATUS_VARIANT_MAP = {
  active: "success",
  draft: "warning",
  archived: "destructive",
} as const;

const ROLE_OPTIONS: SelectCellOption<"admin" | "editor" | "superadmin" | "viewer">[] = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Superadmin", value: "superadmin" },
  { label: "Viewer", value: "viewer" },
];

const getShowcaseRowId = (row: ShowcaseItem) => row.id;

const TITLES = [
  "Aerodynamic Aluminum Keyboard",
  "Ergonomic Mesh Chair",
  'Ultrawide Curved Monitor 34"',
  "Studio Monitor Speakers",
  "Wireless Noise-Cancelling Headphones",
  "Precision Optical Mouse",
  "Motorized Standing Desk",
  "4K USB-C Webcam",
  "Microphone Boom Arm",
  "RGB Desk Pad",
  "Mechanical Numpad",
  "Dual Monitor Arm Mount",
];

const CATEGORIES = ["Hardware", "Furniture", "Audio", "Accessories", "Peripherals"];
const ROLES: ShowcaseItem["role"][] = ["admin", "editor", "superadmin", "viewer"];
const STATUSES: ShowcaseItem["status"][] = ["active", "draft", "archived"];
const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

const PRODUCT_THUMBNAILS = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80", // Headphones
  "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&auto=format&fit=crop&q=80", // Keyboard
  "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&auto=format&fit=crop&q=80", // Laptop
  "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80", // ANC headset
  "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&auto=format&fit=crop&q=80", // Earbuds
  "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&auto=format&fit=crop&q=80", // Monitor
  "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=200&auto=format&fit=crop&q=80", // Mouse
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&auto=format&fit=crop&q=80", // Smartphone
  "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&auto=format&fit=crop&q=80", // Desk lamp
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80", // Watch
];

const USER_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
];

/**
 * 演示缩略图：每 5 条生成一组 4 图相册，每 7 条留空以演示空态
 */
function buildThumbnail(index: number): string | string[] {
  if (index % 7 === 0) {
    return "";
  }
  if (index % 5 === 0) {
    return [
      PRODUCT_THUMBNAILS[index % PRODUCT_THUMBNAILS.length],
      PRODUCT_THUMBNAILS[(index + 1) % PRODUCT_THUMBNAILS.length],
      PRODUCT_THUMBNAILS[(index + 2) % PRODUCT_THUMBNAILS.length],
      PRODUCT_THUMBNAILS[(index + 3) % PRODUCT_THUMBNAILS.length],
    ];
  }
  return PRODUCT_THUMBNAILS[index % PRODUCT_THUMBNAILS.length];
}

const INITIAL_DATA: ShowcaseItem[] = Array.from({ length: 48 }, (_, i) => {
  const idNum = 101 + i;
  const role = ROLES[i % ROLES.length];
  const status = STATUSES[i % STATUSES.length];
  const category = CATEGORIES[i % CATEGORIES.length];
  const title = `${TITLES[i % TITLES.length]} Gen ${Math.floor(i / TITLES.length) + 1}`;
  const isFeatured = i % 3 === 0;
  const isVerified = i % 2 === 0;
  const authorNames = ["Alex Chen", "Sarah Miller", "David Kim", "Elena Rostova"];
  const tagSets = [
    ["React", "TypeScript", "Tailwind", "Next.js", "Shadcn"],
    ["Frontend", "UI/UX", "Design"],
    ["Node.js", "Bun", "API", "REST", "GraphQL"],
    ["DevOps", "Docker", "CI/CD"],
  ];
  const sparklines = [
    [10, 15, 12, 18, 25, 22, 30],
    [40, 35, 38, 20, 18, 15, 10],
    [20, 22, 21, 24, 23, 25, 26],
    [5, 8, 12, 19, 15, 28, 35],
  ];

  const userStatuses: ("online" | "offline" | "busy" | "away")[] = [
    "online",
    "away",
    "busy",
    "offline",
  ];
  const isUnassigned = i % 8 === 0;

  return {
    id: `ITEM-${idNum}`,
    title,
    category,
    status,
    avatar: PRODUCT_THUMBNAILS[i % PRODUCT_THUMBNAILS.length],
    thumbnail: buildThumbnail(i),
    color: COLORS[i % COLORS.length],
    isFeatured,
    isVerified,
    publishedAt: new Date(2026, 0, 1 + (i % 28)).toISOString(),
    stock: ((i * 17) % 200) + 5,
    price: Math.round((((i * 23.5) % 800) + 29.99) * 100) / 100,
    completionRate: (i * 19) % 100,
    role,
    isSelected: i === 0,
    notes: `Inventory SKU batch #${idNum} verified`,
    author: isUnassigned
      ? {
          name: undefined,
          subtitle: "待管理员指派负责人",
        }
      : {
          name: authorNames[i % authorNames.length],
          avatarUrl: i % 3 === 0 ? undefined : USER_AVATARS[i % USER_AVATARS.length],
          subtitle: `${authorNames[i % authorNames.length].toLowerCase().replace(" ", ".")}@corp.io`,
          status: userStatuses[i % userStatuses.length],
          verified: i % 2 === 0,
        },
    rating: Math.round((3.0 + (i % 21) * 0.1) * 10) / 10,
    trend: sparklines[i % sparklines.length],
    apiKey: `sk_live_demo_${1000000000 + i * 837261947}_key`,
    tags: tagSets[i % tagSets.length],
  };
});

const SHOWCASE_FILTERS: DataTableFilterDefinition[] = [
  {
    type: "select",
    field: "role",
    label: "User Role",
    options: [
      { label: "Admin", value: "admin", badgeColor: "blue" },
      { label: "Editor", value: "editor", badgeColor: "emerald" },
      { label: "Superadmin", value: "superadmin", badgeColor: "purple" },
      { label: "Viewer", value: "viewer", badgeColor: "amber" },
    ],
  },
  {
    type: "select",
    field: "status",
    label: "Record Status",
    options: [
      { label: "Active", value: "active", badgeColor: "emerald" },
      { label: "Draft", value: "draft", badgeColor: "amber" },
      { label: "Archived", value: "archived", badgeColor: "rose" },
    ],
  },
  {
    type: "ternary",
    field: "isFeatured",
    label: "Featured Item",
    trueLabel: "Featured only",
    falseLabel: "Standard only",
  },
  {
    type: "ternary",
    field: "isVerified",
    label: "Verified Identity",
    trueLabel: "Verified only",
    falseLabel: "Unverified only",
  },
];

/**
 * 系统预置视图（纯静态，与组件状态无关）
 * filterModel 为 DataTable 实际消费的字段（applyView 读取 view.filterModel）
 */
const SHOWCASE_SAVED_VIEWS: DataTableSavedView[] = [
  {
    id: "preset-high-value",
    name: "High Value Items (>$200)",
    isSystem: true,
    filterModel: {
      items: [{ id: "view-f1", field: "price", operator: "greaterThan", value: 200 }],
    },
  },
  {
    id: "preset-verified",
    name: "Verified Authors Only",
    isSystem: true,
    filterModel: {
      items: [{ id: "view-f2", field: "isVerified", operator: "equals", value: true }],
    },
  },
  {
    id: "preset-hardware",
    name: "Hardware Products",
    isSystem: true,
    filterModel: {
      items: [{ id: "view-f3", field: "category", operator: "equals", value: "Hardware" }],
    },
  },
];

/**
 * 主从（Master-Detail）视图列定义（纯静态，回调只依赖 row）
 */
const MASTER_DETAIL_COLUMNS: DataTableColDef<ShowcaseItem>[] = [
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

export function TableShowcasePage() {
  const [data, setData] = useState<ShowcaseItem[]>(INITIAL_DATA);
  const [showEmptyData, setShowEmptyData] = useState(false);
  const [filterLayout, setFilterLayout] = useState<DataTableFilterLayout>("popover");
  const [deferFilters, setDeferFilters] = useState<boolean>(true);
  const [showQueryBuilder, setShowQueryBuilder] = useState<boolean>(true);
  const [showActiveFiltersPills, setShowActiveFiltersPills] = useState<boolean>(true);
  const [columnsCount, setColumnsCount] = useState<1 | 2 | 3 | 4>(2);
  const [paginationVariant, setPaginationVariant] = useState<"capsule" | "shadcn" | "simple">(
    "capsule",
  );

  const updateItem = useMemoizedFn((id: string, patch: Partial<ShowcaseItem>) => {
    setData((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  });

  const removeItem = useMemoizedFn((id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    toast.error(`Deleted ${id}`);
  });

  const [singleExpand, setSingleExpand] = useState<boolean>(false);
  const [expandOnRowClick, setExpandOnRowClick] = useState<boolean>(false);

  const showcaseTabs = useMemo<DataTableTabItem[]>(() => {
    // 单次遍历统计各状态数量，避免对 data 连做三次 filter
    const statusCounts: Record<ShowcaseItem["status"], number> = {
      active: 0,
      draft: 0,
      archived: 0,
    };
    for (const row of data) {
      statusCounts[row.status] += 1;
    }

    return [
      { id: "all", label: "All Records", badge: data.length },
      {
        id: "active",
        label: "Active",
        icon: CheckCircle2,
        badge: statusCounts.active,
        filterModel: {
          items: [{ id: "tab-f1", field: "status", operator: "equals", value: "active" }],
        },
      },
      {
        id: "draft",
        label: "Drafts",
        icon: Clock,
        badge: statusCounts.draft,
        filterModel: {
          items: [{ id: "tab-f2", field: "status", operator: "equals", value: "draft" }],
        },
      },
      {
        id: "archived",
        label: "Archived",
        icon: Archive,
        badge: statusCounts.archived,
        filterModel: {
          items: [{ id: "tab-f3", field: "status", operator: "equals", value: "archived" }],
        },
      },
    ] satisfies DataTableTabItem[];
  }, [data]);

  const renderExpandedShowcaseRow = useMemoizedFn(
    ({ row, collapse }: { row: ShowcaseItem; collapse: () => void }) => {
      return (
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
          {/* Column 1: Inventory & Specs */}
          <div className="border-border/50 bg-background/50 space-y-2 rounded-lg border p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-xs font-semibold">SKU & Batch Details</span>
              <Badge variant="outline" className="text-[10px] tracking-wider uppercase">
                {row.category}
              </Badge>
            </div>
            <div className="text-muted-foreground space-y-1 text-xs">
              <p className="flex justify-between">
                <span>Item ID:</span> <span className="text-foreground font-mono">{row.id}</span>
              </p>
              <p className="flex justify-between">
                <span>Unit Price:</span>{" "}
                <span className="text-foreground font-medium">${row.price.toFixed(2)}</span>
              </p>
              <p className="flex justify-between">
                <span>Available Stock:</span>{" "}
                <span className={row.stock < 20 ? "text-destructive font-bold" : "text-foreground"}>
                  {row.stock} units
                </span>
              </p>
              <p className="flex justify-between">
                <span>Quality Rating:</span>{" "}
                <span className="text-foreground">⭐ {row.rating} / 5.0</span>
              </p>
            </div>
            <div className="pt-1">
              <p className="text-muted-foreground mb-1 text-[11px] font-medium">Product Tags</p>
              <div className="flex flex-wrap gap-1">
                {row.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: API Keys & Integration */}
          <div className="border-border/50 bg-background/50 space-y-2 rounded-lg border p-3.5">
            <span className="text-foreground text-xs font-semibold">
              Integration & API Credentials
            </span>
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-[11px]">Live Webhook Key</p>
              <div className="border-border/60 bg-muted/30 flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px]">
                <span className="truncate">{row.apiKey}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground h-5 w-5 shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(row.apiKey);
                    toast.success("API key copied to clipboard!");
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="text-muted-foreground pt-1 text-xs">
              <p className="text-foreground font-medium">Audit Notes:</p>
              <p className="bg-muted/20 text-muted-foreground mt-0.5 rounded p-1.5 text-[11px] italic">
                "{row.notes}"
              </p>
            </div>
          </div>

          {/* Column 3: Lead & Quick Actions */}
          <div className="border-border/50 bg-background/50 flex flex-col justify-between space-y-3 rounded-lg border p-3.5">
            <div className="space-y-2">
              <span className="text-foreground text-xs font-semibold">Author & Operations</span>
              <div className="flex items-center gap-2.5">
                {row.author.avatarUrl ? (
                  <img
                    src={row.author.avatarUrl}
                    alt={row.author.name ?? "User"}
                    className="border-border h-8 w-8 rounded-full border object-cover"
                  />
                ) : (
                  <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                    {row.author.name?.charAt(0) ?? "?"}
                  </div>
                )}
                <div className="space-y-0.5 text-xs">
                  <p className="text-foreground leading-none font-medium">
                    {row.author.name ?? "Unassigned"}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    {row.author.subtitle ?? "Team Member"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 flex-1 gap-1 text-xs"
                onClick={() => toast.info(`Restock triggered for ${row.id}`)}
              >
                <Sparkles className="text-primary h-3 w-3" />
                Restock
              </Button>
              <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={collapse}>
                Collapse
              </Button>
            </div>
          </div>
        </div>
      );
    },
  );

  const isAllSelected = useMemo(
    () => data.length > 0 && data.every((item) => item.isSelected),
    [data],
  );
  const isSomeSelected = useMemo(
    () => data.some((item) => item.isSelected) && !isAllSelected,
    [data, isAllSelected],
  );

  const columns = useMemo<DataTableColDef<ShowcaseItem>[]>(
    () => [
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
        onBadgeClick: (row, statusVal) =>
          toast.info(`Filter applied for status: ${statusVal} (${row.id})`),
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
      selectCol<ShowcaseItem, "admin" | "editor" | "superadmin" | "viewer">(
        "role",
        "Role (SelectCol)",
        {
          width: 140,
          options: ROLE_OPTIONS,
          onCellChange: async (row, nextRole) => {
            await delay(300);
            updateItem(row.id, { role: nextRole });
            toast.success(`Role for ${row.id} changed to ${nextRole}`);
          },
        },
      ),
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
    ],
    [isAllSelected, isSomeSelected, updateItem, removeItem],
  );

  return (
    <div className="max-w-full min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Filament v5 Table Columns Showcase</h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Live gallery demonstrating 15 table column types alongside Filament v5 Capsule segmented
          pagination and multi-layout Filter systems (Popover, Slide-over Sheet, Above Content,
          Deferred filters).
        </p>
      </div>

      {/* Interactive Controls Bar */}
      <div className="border-border/60 bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">Filter Layout:</span>
          <div className="border-border/80 bg-muted/30 inline-flex rounded-lg border p-0.5">
            <Button
              variant={filterLayout === "popover" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterLayout("popover")}
              className="h-7 px-2.5 text-xs"
            >
              Popover ({columnsCount} col{columnsCount > 1 ? "s" : ""})
            </Button>
            <Button
              variant={filterLayout === "sheet" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterLayout("sheet")}
              className="h-7 px-2.5 text-xs"
            >
              Slide-over Sheet
            </Button>
            <Button
              variant={filterLayout === "aboveContent" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilterLayout("aboveContent")}
              className="h-7 px-2.5 text-xs"
            >
              Above Content
            </Button>
          </div>

          {filterLayout === "popover" && (
            <div className="border-border/80 bg-muted/30 inline-flex rounded-lg border p-0.5">
              {([1, 2, 3] as const).map((cols) => (
                <Button
                  key={cols}
                  variant={columnsCount === cols ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setColumnsCount(cols)}
                  className="h-7 px-2 text-xs"
                >
                  {cols}C
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeferFilters(!deferFilters)}
            className="h-8 gap-1.5 text-xs"
          >
            <span>Defer Filters:</span>
            <Badge variant={deferFilters ? "default" : "secondary"} className="text-[10px]">
              {deferFilters ? "ON (Apply btn)" : "OFF (Live)"}
            </Badge>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQueryBuilder(!showQueryBuilder)}
            className="h-8 gap-1.5 text-xs"
          >
            <span>Query Builder:</span>
            <Badge variant={showQueryBuilder ? "default" : "secondary"} className="text-[10px]">
              {showQueryBuilder ? "Enabled" : "Disabled"}
            </Badge>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActiveFiltersPills(!showActiveFiltersPills)}
            className="h-8 gap-1.5 text-xs"
          >
            <span>Filter Pills:</span>
            <Badge
              variant={showActiveFiltersPills ? "default" : "secondary"}
              className="text-[10px]"
            >
              {showActiveFiltersPills ? "Shown" : "Hidden"}
            </Badge>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPaginationVariant(
                paginationVariant === "capsule"
                  ? "shadcn"
                  : paginationVariant === "shadcn"
                    ? "simple"
                    : "capsule",
              )
            }
            className="h-8 gap-1.5 text-xs"
          >
            <span>Pagination:</span>
            <Badge
              variant={
                paginationVariant === "capsule"
                  ? "default"
                  : paginationVariant === "shadcn"
                    ? "outline"
                    : "secondary"
              }
              className="text-[10px]"
            >
              {paginationVariant === "capsule"
                ? "Capsule v5"
                : paginationVariant === "shadcn"
                  ? "Shadcn UI"
                  : "Simple"}
            </Badge>
          </Button>
        </div>
      </div>

      <Card className="border-border/60 max-w-full min-w-0 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Interactive DataTable with Filament v5 Features
          </CardTitle>
          <CardDescription className="text-xs">
            Try toggling the filter drawer or above-content inline panel, applying ternary filters,
            assembling dynamic rules in Query Builder, and navigating through pages with capsule
            pagination.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-full min-w-0 overflow-hidden p-0">
          <div className="w-full max-w-full min-w-0 overflow-hidden">
            <DataTable
              rows={data}
              columns={columns}
              loading={false}
              getRowId={getShowcaseRowId}
              paginationMode="client"
              paginationVariant={paginationVariant}
              filterConfig={{
                layout: filterLayout,
                columns: columnsCount,
                deferFilters,
                showQueryBuilder,
                showActiveFiltersPills,
                sheetTitle: "Filter Showcase Items",
                sheetDescription: "Filter records using Filament v5 multi-layout architecture.",
              }}
              filters={SHOWCASE_FILTERS}
            />
          </div>
        </CardContent>
      </Card>

      {/* Enterprise Master-Detail & Status Tabs Architecture */}
      <Card className="border-border/60 max-w-full min-w-0 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">
                Enterprise Master-Detail & Saved Views Architecture (Linear & Airtable Pattern)
              </CardTitle>
              <CardDescription className="text-xs">
                Nested row expansion with smooth animations, accordion toggle, and row click mode,
                integrated with status segmented tabs and saved views management.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSingleExpand(!singleExpand)}
                className="h-7 gap-1.5 text-xs"
              >
                <span>Accordion (Single Expand):</span>
                <Badge variant={singleExpand ? "default" : "secondary"} className="text-[10px]">
                  {singleExpand ? "Enabled" : "Disabled"}
                </Badge>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandOnRowClick(!expandOnRowClick)}
                className="h-7 gap-1.5 text-xs"
              >
                <span>Row Click Expand:</span>
                <Badge variant={expandOnRowClick ? "default" : "secondary"} className="text-[10px]">
                  {expandOnRowClick ? "Enabled" : "Disabled"}
                </Badge>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="max-w-full min-w-0 overflow-hidden p-0">
          <div className="w-full max-w-full min-w-0 overflow-hidden">
            <DataTable
              rows={data}
              columns={MASTER_DETAIL_COLUMNS}
              getRowId={getShowcaseRowId}
              paginationMode="client"
              pageSize={10}
              tabs={showcaseTabs}
              savedViews={SHOWCASE_SAVED_VIEWS}
              renderExpandedRow={renderExpandedShowcaseRow}
              expansionProps={{
                singleExpand,
                expandOnRowClick,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filament v5 Tables Empty State Architecture Showcase */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Filament v5 Tables Empty State Architecture
          </CardTitle>
          <CardDescription className="text-xs">
            Pure UI Kit container and integrated DataTable overlay with dual typography, badge
            icons, action buttons, and semantic colors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Size: sm + primary */}
            <div className="border-border/50 bg-card flex flex-col justify-center rounded-xl border p-2">
              <TableEmptyState
                size="sm"
                iconColor="primary"
                heading="No active tasks"
                description="Create a new task to get started."
                actions={[
                  {
                    label: "New Task",
                    icon: Plus,
                    onClick: () => toast.success("New Task clicked"),
                  },
                ]}
              />
            </div>

            {/* Size: md + warning (Filtered / No Results state) */}
            <div className="border-border/50 bg-card flex flex-col justify-center rounded-xl border p-2">
              <TableEmptyState
                size="md"
                iconColor="warning"
                heading="No matching records"
                description="No records match your active filters or search criteria."
                actions={[
                  {
                    label: "Reset filters",
                    icon: RotateCcw,
                    variant: "outline",
                    onClick: () => toast.info("Reset filters clicked"),
                  },
                ]}
              />
            </div>

            {/* Size: sm + destructive */}
            <div className="border-border/50 bg-card flex flex-col justify-center rounded-xl border p-2">
              <TableEmptyState
                size="sm"
                iconColor="destructive"
                heading="Connection error"
                description="Failed to retrieve remote table data."
                actions={[
                  {
                    label: "Retry",
                    variant: "outline",
                    onClick: () => toast.info("Retry clicked"),
                  },
                ]}
              />
            </div>
          </div>

          {/* DataTable with custom emptyState configuration */}
          <div className="border-border/60 bg-muted/20 space-y-3 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-foreground text-xs font-semibold">
                  DataTable with Empty State Simulation
                </h4>
                <p className="text-muted-foreground text-[11px]">
                  Toggle empty dataset to preview integrated DataTable empty overlay with custom
                  actions.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowEmptyData(!showEmptyData)}
              >
                {showEmptyData ? "Hide Simulation" : "Simulate Empty Table"}
              </Button>
            </div>

            {showEmptyData && (
              <div className="border-border/60 bg-card overflow-hidden rounded-lg border">
                <DataTable
                  rows={[]}
                  columns={columns.slice(0, 5)}
                  getRowId={getShowcaseRowId}
                  hidePagination
                  emptyState={{
                    iconColor: "primary",
                    heading: "No showcase records found",
                    description:
                      "Get started by generating synthetic records or resetting query params.",
                    actions: [
                      {
                        label: "Restore Records",
                        icon: Sparkles,
                        onClick: () => {
                          setShowEmptyData(false);
                          toast.success("Showcase records restored!");
                        },
                      },
                    ],
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* TanStack DB Reactive Live Grid & Optimistic Updates Showcase */}
      <TanStackDbShowcase />
    </div>
  );
}
