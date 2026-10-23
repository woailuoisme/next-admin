import type { BasemapPreset, CascaderOption, CoordinateSystem, TreeSelectNode } from "@/components/form";

import type { ShowcaseFormValues } from "./types";

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
  {
    label: "Starter",
    value: "starter",
    description: "Free for individual hobby projects",
  },
  {
    label: "Pro Team",
    value: "pro",
    description: "Collaborative features & priority SLA",
  },
  {
    label: "Enterprise",
    value: "enterprise",
    description: "Unlimited scale, dedicated audit logs",
  },
];

export const INTEREST_OPTIONS = [
  { label: "AI & Neural Nets", value: "ai" },
  { label: "Web Frameworks", value: "tech" },
  { label: "Database Scaling", value: "db" },
  { label: "DevOps & Cloud", value: "devops" },
];

export const REGION_OPTIONS: CascaderOption[] = [
  {
    value: "zhejiang",
    label: "浙江省",
    children: [
      {
        value: "hangzhou",
        label: "杭州市",
        children: [
          { value: "xihu", label: "西湖区" },
          { value: "binjiang", label: "滨江区" },
          { value: "yuhang", label: "余杭区" },
        ],
      },
      {
        value: "ningbo",
        label: "宁波市",
        children: [
          { value: "haishu", label: "海曙区" },
          { value: "yinzhou", label: "鄞州区" },
        ],
      },
    ],
  },
  {
    value: "jiangsu",
    label: "江苏省",
    children: [
      {
        value: "nanjing",
        label: "南京市",
        children: [
          { value: "xuanwu", label: "玄武区" },
          { value: "gulou", label: "鼓楼区" },
        ],
      },
      {
        value: "suzhou",
        label: "苏州市",
        children: [
          { value: "gusu", label: "姑苏区" },
          { value: "wuzhong", label: "吴中区" },
        ],
      },
    ],
  },
  {
    value: "guangdong",
    label: "广东省",
    children: [
      {
        value: "guangzhou",
        label: "广州市",
        children: [
          { value: "tianhe", label: "天河区" },
          { value: "yuexiu", label: "越秀区" },
        ],
      },
      {
        value: "shenzhen",
        label: "深圳市",
        children: [
          { value: "nanshan", label: "南山区" },
          { value: "futian", label: "福田区" },
        ],
      },
    ],
  },
];

export const ORG_TREE_DATA: TreeSelectNode[] = [
  {
    value: "headquarters",
    label: "集团总部",
    children: [
      {
        value: "rd_center",
        label: "全球研发中心",
        children: [
          { value: "fe_arch", label: "前端架构组" },
          { value: "be_core", label: "基础平台组" },
          { value: "ai_lab", label: "AI 智能实验室" },
        ],
      },
      {
        value: "design_center",
        label: "体验设计中心",
        children: [
          { value: "ux_design", label: "交互设计团队" },
          { value: "brand_design", label: "视觉品牌创意团队" },
        ],
      },
      {
        value: "business_center",
        label: "商业化运营部",
        children: [
          { value: "global_sales", label: "全球大客户销售部" },
          { value: "customer_success", label: "客户成功服务团队" },
        ],
      },
    ],
  },
];

export const PERMISSION_TREE_DATA: TreeSelectNode[] = [
  {
    value: "sys_root",
    label: "系统全量权限",
    children: [
      {
        value: "user_mgmt",
        label: "用户与账户管理",
        children: [
          { value: "user_create", label: "创建用户" },
          { value: "user_edit", label: "编辑用户详情" },
          { value: "user_delete", label: "注销/删除账号" },
          { value: "user_export", label: "导出用户列表" },
        ],
      },
      {
        value: "role_perm",
        label: "角色与访问控制",
        children: [
          { value: "role_assign", label: "分配角色" },
          { value: "audit_log", label: "查看安全审计日志" },
          { value: "mfa_reset", label: "重置二要素校验" },
        ],
      },
      {
        value: "infra_setting",
        label: "基础设施与网关配置",
        children: [
          { value: "gateway_rule", label: "更新 API 网关流控规则" },
          { value: "secret_rotate", label: "密钥轮换管理" },
        ],
      },
    ],
  },
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

/** BackToTop 局部容器演示用的静态长列表 */
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
export const createDefaultInvoiceItem = () => ({
  sku: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
});

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
  metadata: {
    tier: "enterprise",
    security_clearance: "level_4",
  },
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
    "<h2>Welcome to TanStack Dashboard</h2><p>This rich content is managed by <strong>TipTap</strong>, matching the <em>Filament v5</em> RichEditor experience.</p><ul><li><p>Full WYSIWYG editing</p></li><li><p>Dual-mode HTML/Markdown output</p></li></ul>",
  password: "SecretPassword123!",
  twoFactorCode: "884192",
  annualSalary: 165000,
  contactPhone: "4155552671",
  ratingScore: 4.5,
  billingCycle: "annual",
  officeLocation: {
    lng: 121.4737,
    lat: 31.2304,
    address: "上海市黄浦区人民广场",
  },
  warehouseLocation: {
    lng: 114.0579,
    lat: 22.5431,
    address: "广东省深圳市福田区市民中心",
  },
};
