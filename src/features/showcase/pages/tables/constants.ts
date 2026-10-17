import type {
  DataTableFilterDefinition,
  DataTableSavedView,
  SelectCellOption,
} from "@/components/data-table";

import type { ShowcaseItem } from "./types";

export const STATUS_VARIANT_MAP = {
  active: "success",
  draft: "warning",
  archived: "destructive",
} as const;

export const ROLE_OPTIONS: SelectCellOption<"admin" | "editor" | "superadmin" | "viewer">[] = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Superadmin", value: "superadmin" },
  { label: "Viewer", value: "viewer" },
];

export const getShowcaseRowId = (row: ShowcaseItem) => row.id;

export const TITLES = [
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

export const CATEGORIES = ["Hardware", "Furniture", "Audio", "Accessories", "Peripherals"];
export const ROLES: ShowcaseItem["role"][] = ["admin", "editor", "superadmin", "viewer"];
export const STATUSES: ShowcaseItem["status"][] = ["active", "draft", "archived"];
export const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

export const PRODUCT_THUMBNAILS = [
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

export const USER_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
];

/**
 * 演示缩略图：每 5 条生成一组 4 图相册，每 7 条留空以演示空态
 */
export function buildThumbnail(index: number): string | string[] {
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

export const INITIAL_DATA: ShowcaseItem[] = Array.from({ length: 48 }, (_, i) => {
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

  const userStatuses: ("online" | "offline" | "busy" | "away")[] = ["online", "away", "busy", "offline"];
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

export const SHOWCASE_FILTERS: DataTableFilterDefinition[] = [
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
export const SHOWCASE_SAVED_VIEWS: DataTableSavedView[] = [
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
