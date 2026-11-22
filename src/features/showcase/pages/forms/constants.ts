import type { BasemapPreset } from "@/components/map/presets/basemaps";
import type { CoordinateSystem } from "@/components/map/utils/coordinates";

import type { ShowcaseFormValues } from "./types";

export * from "./treeConstants";

export const ROLE_OPTIONS = [
  { label: "Lead Engineer", value: "engineer" },
  { label: "Product Manager", value: "pm" },
  { label: "UX Designer", value: "designer" },
];

export const DEPARTMENT_OPTIONS = [
  { label: "Research & Development", value: "research" },
  { label: "Engineering Operations", value: "engineering" },
  { label: "Product Growth", value: "growth" },
  { label: "Customer Success", value: "support" },
];

export const DEVICE_OPTIONS = [
  { label: "Desktop", value: "desktop" },
  { label: "Tablet", value: "tablet" },
  { label: "Mobile", value: "mobile" },
];

export const PLAN_OPTIONS = [
  { label: "Starter", value: "starter", description: "Free for individual hobby projects" },
  { label: "Pro Team", value: "pro", description: "Collaborative features & priority SLA" },
  { label: "Enterprise", value: "enterprise", description: "Unlimited scale, dedicated audit logs" },
];

export const INTEREST_OPTIONS = [
  { label: "AI & Neural Nets", value: "ai" },
  { label: "Web Frameworks", value: "tech" },
  { label: "Database Scaling", value: "db" },
  { label: "DevOps & Cloud", value: "devops" },
];

export const TAG_SUGGESTIONS = ["GraphQL", "Docker", "Tailwind", "Rust"];

export const BASEMAP_SELECT_OPTIONS: Array<{ label: string; value: BasemapPreset }> = [
  { label: "高德地图 (Amap)", value: "amap" },
  { label: "矢量浅/深色 (Carto)", value: "carto" },
  { label: "开放街道 (OSM)", value: "osm" },
  { label: "天地图 (Tianditu)", value: "tianditu" },
];

export const COORDINATE_SYSTEM_OPTIONS: Array<{ label: string; value: CoordinateSystem }> = [
  { label: "WGS-84 (GPS标准)", value: "WGS84" },
  { label: "GCJ-02 (国测局火星)", value: "GCJ02" },
  { label: "BD-09 (百度坐标)", value: "BD09" },
];

export const LOCAL_SCROLL_ITEMS = [
  { id: "p1", title: "局部列表段落 #1" },
  { id: "p2", title: "局部列表段落 #2" },
  { id: "p3", title: "局部列表段落 #3" },
  { id: "p4", title: "局部列表段落 #4" },
  { id: "p5", title: "局部列表段落 #5" },
  { id: "p6", title: "局部列表段落 #6" },
  { id: "p7", title: "局部列表段落 #7" },
  { id: "p8", title: "局部列表段落 #8" },
];

export const formatRating = (val: number) => `${val}%`;
export const createDefaultAttribute = () => ({ name: "", value: "" });
export const getAttributeTitle = (item: { name: string; value: string }, idx: number) =>
  item.name ? `${item.name}` : `Attribute #${idx + 1}`;
export const createDefaultInvoiceItem = () => ({ sku: "", description: "", quantity: 1, unitPrice: 0 });

export const DEFAULT_VALUES: ShowcaseFormValues = {
  name: "Alex Vance",
  email: "alex.vance@blackmesa.org",
  bio: "Lead research engineer specializing in quantum portal telemetry.",
  age: 28,
  rating: 85,
  role: "engineer",
  department: "research",
  plan: "pro",
  notificationsEnabled: true,
  allowMarketing: false,
  deviceType: "desktop",
  interests: ["tech", "ai"],
  region: ["zhejiang", "hangzhou", "xihu"],
  category: [],
  orgDepartment: "fe_arch",
  permissionNodes: ["user_create", "user_edit"],
  asyncProjectNode: "",
  joinDate: "2026-03-01",
  vacationRange: {},
  dailyCheckinTime: "09:30",
  accentColor: "#3b82f6",
  tags: ["TypeScript", "TanStack", "React 19"],
  metadata: { tier: "enterprise", security_clearance: "level_4" },
  customAttributes: [
    { name: "Location", value: "Sector C Test Lab" },
    { name: "Badge ID", value: "BM-8841" },
  ],
  invoiceItems: [
    { sku: "SKU-9901", description: "Edge Gateway Server", quantity: 2, unitPrice: 1200 },
    { sku: "SKU-9902", description: "Optical Transceiver 100G", quantity: 4, unitPrice: 350 },
  ],
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  attachments: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80"],
  articleContent:
    "## Welcome to TanStack Dashboard\n\nThis rich content is managed by **Plate**, built natively on *shadcn/ui* and Markdown.\n\n- Full WYSIWYG block editing\n- Native Fixed & Floating Toolbars with Markdown serialization",
  password: "SecretPassword123!",
  twoFactorCode: "884192",
  annualSalary: 165000,
  contactPhone: "4155552671",
  ratingScore: 4.5,
  billingCycle: "annual",
  officeLocation: { lng: 121.4737, lat: 31.2304, address: "上海市黄浦区人民广场" },
  warehouseLocation: { lng: 114.0579, lat: 22.5431, address: "广东省深圳市福田区市民中心" },
};

export const DEMO_CITY_PRESETS = [
  { label: "Beijing", coords: { lng: 116.4074, lat: 39.9042 } },
  { label: "Shanghai", coords: { lng: 121.4737, lat: 31.2304 } },
  { label: "Shenzhen", coords: { lng: 114.0579, lat: 22.5431 } },
  { label: "Hangzhou", coords: { lng: 120.1551, lat: 30.2741 } },
  { label: "Guangzhou", coords: { lng: 113.2644, lat: 23.1291 } },
];
