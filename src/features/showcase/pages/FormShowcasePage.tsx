"use client";

import { useForm } from "@tanstack/react-form";
import { useMemoizedFn } from "ahooks";
import {
  Calendar,
  CheckCircle2,
  Layers,
  Mail,
  MapPin,
  Palette,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { type SyntheticEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { BackToTop } from "@/components/back-to-top";
import {
  type BasemapPreset,
  CheckboxGroup,
  CheckboxInput,
  CascaderInput,
  type CascaderOption,
  TreeSelectInput,
  type TreeSelectNode,
  ColorPickerInput,
  ComboboxInput,
  type CoordinateSystem,
  CurrencyInput,
  DatePickerInput,
  DateRangePickerInput,
  FileUploadInput,
  FormFieldset,
  FormGrid,
  FormLocationPicker,
  FormSection,
  FormTabs,
  KeyValueInput,
  type LocationPickerValue,
  MaskedInput,
  NumberInput,
  OtpInput,
  PasswordInput,
  RadioGroupInput,
  RatingInput,
  Repeater,
  LazyRichEditorInput,
  SegmentedControl,
  SelectInput,
  SliderInput,
  SwitchInput,
  TagsInput,
  TextareaInput,
  TextInput,
  TimePickerInput,
  ToggleButtons,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { ResourceShowcaseSection } from "../components/ResourceShowcaseSection";

export interface ShowcaseFormValues {
  // Basic
  name: string;
  email: string;
  bio: string;
  age: number | null;
  rating: number;
  role: string;
  department: string;
  // Choices & Toggles
  plan: string;
  notificationsEnabled: boolean;
  allowMarketing: boolean;
  deviceType: string;
  interests: (string | number)[];
  region: (string | number)[];
  category: (string | number)[];
  orgDepartment: string;
  permissionNodes: (string | number)[];
  asyncProjectNode: string;
  // Date & Time
  joinDate: string;
  vacationRange: { from?: Date; to?: Date };
  dailyCheckinTime: string;
  // Advanced & Composite
  accentColor: string;
  tags: string[];
  metadata: Record<string, string>;
  customAttributes: Array<{ name: string; value: string }>;
  invoiceItems: Array<{ sku: string; description: string; quantity: number; unitPrice: number }>;
  // Media & Rich Content
  avatarUrl: string;
  attachments: string[];
  articleContent: string;
  // Security & Finance Additions
  password: string;
  twoFactorCode: string;
  annualSalary: number | null;
  contactPhone: string;
  ratingScore: number | null;
  billingCycle: string;
  // Geographic & Geospatial Additions
  officeLocation: LocationPickerValue;
  warehouseLocation: LocationPickerValue;
}

const ROLE_OPTIONS = [
  { label: "Lead Engineer", value: "engineer" },
  { label: "Product Manager", value: "pm" },
  { label: "UX Designer", value: "designer" },
];

const DEPARTMENT_OPTIONS = [
  { label: "Research & Development", value: "research" },
  { label: "Engineering Operations", value: "engineering" },
  { label: "Product Growth", value: "growth" },
  { label: "Customer Success", value: "support" },
];

const DEVICE_OPTIONS = [
  { label: "Desktop", value: "desktop" },
  { label: "Tablet", value: "tablet" },
  { label: "Mobile", value: "mobile" },
];

const PLAN_OPTIONS = [
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

const INTEREST_OPTIONS = [
  { label: "AI & Neural Nets", value: "ai" },
  { label: "Web Frameworks", value: "tech" },
  { label: "Database Scaling", value: "db" },
  { label: "DevOps & Cloud", value: "devops" },
];

const REGION_OPTIONS: CascaderOption[] = [
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

const ORG_TREE_DATA: TreeSelectNode[] = [
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

const PERMISSION_TREE_DATA: TreeSelectNode[] = [
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

const TAG_SUGGESTIONS = ["GraphQL", "Docker", "Tailwind", "Rust"];

const BASEMAP_SELECT_OPTIONS: Array<{ label: string; value: BasemapPreset }> = [
  { label: "高德地图 (Amap)", value: "amap" },
  { label: "矢量浅/深色 (Carto)", value: "carto" },
  { label: "开放街道 (OSM)", value: "osm" },
  { label: "天地图 (Tianditu)", value: "tianditu" },
];

const COORDINATE_SYSTEM_OPTIONS: Array<{ label: string; value: CoordinateSystem }> = [
  { label: "WGS-84 (GPS标准)", value: "WGS84" },
  { label: "GCJ-02 (国测局火星)", value: "GCJ02" },
  { label: "BD-09 (百度坐标)", value: "BD09" },
];

/** BackToTop 局部容器演示用的静态长列表 */
const LOCAL_SCROLL_ITEMS = [
  { id: "p1", title: "局部列表段落 #1" },
  { id: "p2", title: "局部列表段落 #2" },
  { id: "p3", title: "局部列表段落 #3" },
  { id: "p4", title: "局部列表段落 #4" },
  { id: "p5", title: "局部列表段落 #5" },
  { id: "p6", title: "局部列表段落 #6" },
  { id: "p7", title: "局部列表段落 #7" },
  { id: "p8", title: "局部列表段落 #8" },
];

const formatRating = (val: number) => `${val}%`;
const createDefaultAttribute = () => ({ name: "", value: "" });
const getAttributeTitle = (item: { name: string; value: string }, idx: number) =>
  item.name ? `${item.name}` : `Attribute #${idx + 1}`;
const createDefaultInvoiceItem = () => ({
  sku: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
});

const DEFAULT_VALUES: ShowcaseFormValues = {
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
  attachments: [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
  ],
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

export function FormShowcasePage() {
  const [submittedData, setSubmittedData] = useState<ShowcaseFormValues | null>(null);

  // Geospatial configuration state for the interactive demo
  const [activeBasemap, setActiveBasemap] = useState<BasemapPreset>("amap");
  const [activeCRS, setActiveCRS] = useState<CoordinateSystem>("WGS84");
  const [showSearch, setShowSearch] = useState(true);
  const [showCoordsInput, setShowCoordsInput] = useState(true);
  const [isLocationDisabled, setIsLocationDisabled] = useState(false);

  // 异步品类级联数据源状态
  const [asyncCategoryOptions, setAsyncCategoryOptions] = useState<CascaderOption[]>([
    {
      value: "digital",
      label: "数码 3C",
      isLeaf: false,
    },
    {
      value: "clothing",
      label: "服饰箱包",
      isLeaf: false,
    },
    {
      value: "home",
      label: "居家生活",
      isLeaf: false,
    },
  ]);

  const handleLoadCategoryData = useMemoizedFn(async (selectedOptions: CascaderOption[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    if (!targetOption) return;

    // 模拟网络请求延迟
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (targetOption.value === "digital") {
      targetOption.children = [
        {
          value: "phones",
          label: "智能手机",
          children: [
            { value: "flagship", label: "旗舰影像手机" },
            { value: "foldable", label: "折叠屏手机" },
          ],
        },
        {
          value: "laptops",
          label: "轻薄笔记本",
          children: [
            { value: "ultrabook", label: "轻薄商务本" },
            { value: "gaming", label: "高性能游戏本" },
          ],
        },
      ];
    } else if (targetOption.value === "clothing") {
      targetOption.children = [
        {
          value: "menswear",
          label: "精品男装",
          children: [
            { value: "jackets", label: "冲锋夹克" },
            { value: "shirts", label: "商务衬衫" },
          ],
        },
        {
          value: "womenswear",
          label: "时尚女装",
          children: [
            { value: "dresses", label: "连身裙" },
            { value: "coats", label: "风衣外套" },
          ],
        },
      ];
    } else if (targetOption.value === "home") {
      targetOption.children = [
        {
          value: "furniture",
          label: "品质家具",
          children: [
            { value: "sofa", label: "人体工学沙发" },
            { value: "bed", label: "实木大床" },
          ],
        },
        {
          value: "appliances",
          label: "智能家电",
          children: [
            { value: "robot", label: "扫地机器人" },
            { value: "purifier", label: "空气净化器" },
          ],
        },
      ];
    }

    setAsyncCategoryOptions([...asyncCategoryOptions]);
  });

  // 异步树形微服务/组件节点数据源状态
  const [asyncProjectTreeData, setAsyncProjectTreeData] = useState<TreeSelectNode[]>([
    {
      value: "cloud_infra",
      label: "云基础设施架构",
      isLeaf: false,
    },
    {
      value: "data_engine",
      label: "数据智能与流批中台",
      isLeaf: false,
    },
    {
      value: "security_mesh",
      label: "企业零信任安全网格",
      isLeaf: false,
    },
  ]);

  const handleLoadProjectNodeData = useMemoizedFn(async (node: TreeSelectNode) => {
    // 模拟网络请求延迟
    await new Promise((resolve) => setTimeout(resolve, 750));

    if (node.value === "cloud_infra") {
      node.children = [
        { value: "k8s_prod", label: "Kubernetes 核心生产集群 (us-west-1)", isLeaf: true },
        { value: "serverless_gateway", label: "Serverless 边缘流量网关", isLeaf: true },
      ];
    } else if (node.value === "data_engine") {
      node.children = [
        { value: "flink_stream", label: "Flink 毫秒级实时流计算引擎", isLeaf: true },
        { value: "vector_db", label: "PgVector 混合语义知识库", isLeaf: true },
      ];
    } else if (node.value === "security_mesh") {
      node.children = [
        { value: "waf_guard", label: "WAF 智能实时威胁阻断系统", isLeaf: true },
        { value: "mtls_cert", label: "mTLS 双向零信任证书管理链", isLeaf: true },
      ];
    }

    setAsyncProjectTreeData([...asyncProjectTreeData]);
  });

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: async ({ value }) => {
      toast.success("Form submitted successfully!");
      setSubmittedData(value);
    },
  });

  const handleSubmit = useMemoizedFn((e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  });

  const handleReset = useMemoizedFn(() => {
    form.reset();
  });

  const tabs = useMemo(
    () => [
      {
        id: "basics",
        label: "Basic Controls",
        icon: Layers,
        children: (
          <div className="space-y-6">
            <FormSection
              title="User Identity & Biography"
              description="Standard inputs, textareas, numeric steppers, and range sliders."
            >
              <FormGrid columns={{ sm: 1, md: 2 }}>
                <TextInput
                  form={form}
                  name="name"
                  label="Full Name"
                  required
                  prefix={<Mail className="size-3.5" />}
                  placeholder="John Doe"
                  colSpan={1}
                />
                <TextInput
                  form={form}
                  name="email"
                  type="email"
                  label="Work Email"
                  required
                  placeholder="name@company.com"
                  colSpan={1}
                />
                <NumberInput
                  form={form}
                  name="age"
                  label="User Age (NumberInput with Steppers)"
                  min={18}
                  max={120}
                  step={1}
                  suffix="years old"
                  colSpan={1}
                />
                <SliderInput
                  form={form}
                  name="rating"
                  label="Performance Score (SliderInput)"
                  min={0}
                  max={100}
                  step={5}
                  formatValue={formatRating}
                  colSpan={1}
                />
                <TextareaInput
                  form={form}
                  name="bio"
                  label="Professional Biography"
                  rows={3}
                  showCount
                  maxLength={300}
                  colSpan="full"
                />
              </FormGrid>
            </FormSection>
          </div>
        ),
      },
      {
        id: "choices",
        label: "Selection & Toggles",
        icon: CheckCircle2,
        badge: "Interactive",
        children: (
          <div className="space-y-6">
            <FormSection
              title="Select, Combobox, Radio & Toggles"
              description="Categorical selectors, searchable dropdowns, and segmented controls."
            >
              <FormGrid columns={{ sm: 1, md: 2 }}>
                <SelectInput
                  form={form}
                  name="role"
                  label="System Role (SelectInput)"
                  options={ROLE_OPTIONS}
                  colSpan={1}
                />
                <ComboboxInput
                  form={form}
                  name="department"
                  label="Department (ComboboxInput Searchable)"
                  placeholder="Search departments..."
                  options={DEPARTMENT_OPTIONS}
                  colSpan={1}
                />
                <ToggleButtons
                  form={form}
                  name="deviceType"
                  label="Target Platform (ToggleButtons Segmented)"
                  options={DEVICE_OPTIONS}
                  fullWidth
                  colSpan="full"
                />
                <RadioGroupInput
                  form={form}
                  name="plan"
                  label="Subscription Tier (RadioGroup Card Variant)"
                  card
                  direction="horizontal"
                  options={PLAN_OPTIONS}
                  colSpan="full"
                />
              </FormGrid>

              <FormFieldset legend="System Switches & Permissions" className="mt-4">
                <FormGrid columns={{ sm: 1, md: 2 }}>
                  <SwitchInput
                    form={form}
                    name="notificationsEnabled"
                    label="Push Notifications"
                    helperText="Receive real-time alerts for critical system triggers."
                    colSpan={1}
                  />
                  <SwitchInput
                    form={form}
                    name="allowMarketing"
                    label="Marketing Outreach"
                    helperText="Allow promotional announcements and user research invites."
                    colSpan={1}
                  />
                </FormGrid>
              </FormFieldset>

              <div className="mt-4">
                <CheckboxGroup
                  form={form}
                  name="interests"
                  label="Topic Subscriptions (CheckboxGroup Checklist)"
                  direction="horizontal"
                  options={INTEREST_OPTIONS}
                />
                <div className="mt-3">
                  <CheckboxInput
                    form={form}
                    name="confirmTerms"
                    label="I accept terms and conditions for automated testing."
                    description="Checking this certifies compliance with company security standards."
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Cascader (级联选择器)"
              description="多列联动视口，支持静态行政区划、异步 loadData 按需加载子级、跨层级路径搜索与表单校验联动。"
            >
              <FormGrid columns={{ sm: 1, md: 2 }}>
                <CascaderInput
                  form={form}
                  name="region"
                  label="行政区划 (静态 3 级 + 路径搜索 + 清除)"
                  placeholder="请选择省市区..."
                  options={REGION_OPTIONS}
                  showSearch
                  clearable
                  colSpan={1}
                  helperText="支持点击逐级展开或在输入框中实时模糊匹配路径并一键选中。"
                />
                <CascaderInput
                  form={form}
                  name="category"
                  label="商品品类 (异步动态加载 loadData + changeOnSelect)"
                  placeholder="请选择商品品类..."
                  options={asyncCategoryOptions}
                  loadData={handleLoadCategoryData}
                  changeOnSelect
                  colSpan={1}
                  helperText="支持 isLeaf: false 动态按需请求子级品类，且允许选中任意一级类目。"
                />
              </FormGrid>
            </FormSection>

            <FormSection
              title="TreeSelect (树选择组件)"
              description="基于 Ant Design 与 shadcn 令牌构建的企业级下拉树，涵盖组织架构单选、权限勾选树 (SHOW_PARENT / SHOW_CHILD)、树形连接线 (treeLine)、异步加载 (loadData) 与标签折叠。"
            >
              <FormGrid columns={{ sm: 1, md: 3 }}>
                <TreeSelectInput
                  form={form}
                  name="orgDepartment"
                  label="组织架构 (单选 + 树形导引线 treeLine + 搜索)"
                  placeholder="请选择所属部门..."
                  treeData={ORG_TREE_DATA}
                  treeLine
                  showIcon
                  showSearch
                  clearable
                  treeDefaultExpandAll
                  colSpan={1}
                  helperText="支持搜索过滤高亮、展开/折叠、自定义图标与层级辅助虚线。"
                />
                <TreeSelectInput
                  form={form}
                  name="permissionNodes"
                  label="权限清单 (复选框 treeCheckable + SHOW_PARENT)"
                  placeholder="请勾选分配权限..."
                  treeData={PERMISSION_TREE_DATA}
                  treeCheckable
                  showCheckedStrategy="SHOW_PARENT"
                  showSearch
                  clearable
                  maxTagCount={2}
                  colSpan={1}
                  helperText="父子节点双向级联选择，支持半选 indeterminate 状态与 +N 标签折叠悬浮查看。"
                />
                <TreeSelectInput
                  form={form}
                  name="asyncProjectNode"
                  label="云资源架构 (异步 loadData + 叶子选择限制)"
                  placeholder="选择目标计算或引擎节点..."
                  treeData={asyncProjectTreeData}
                  loadData={handleLoadProjectNodeData}
                  onlyLeafSelectable
                  showSearch
                  clearable
                  colSpan={1}
                  helperText="点击展开时动态加载微服务节点（附带加载动画），且仅叶子节点可被选中。"
                />
              </FormGrid>
            </FormSection>
          </div>
        ),
      },
      {
        id: "datetime",
        label: "Date & Time",
        icon: Calendar,
        children: (
          <FormSection
            title="Calendar & Time Pickers"
            description="Single date, date range popovers, and 24-hour time pickers."
          >
            <FormGrid columns={{ sm: 1, md: 3 }}>
              <DatePickerInput
                form={form}
                name="joinDate"
                label="Onboarding Date"
                dateFormat="yyyy-MM-dd"
                colSpan={1}
              />
              <DateRangePickerInput
                form={form}
                name="vacationRange"
                label="Leave Range (DateRangePicker)"
                colSpan={1}
              />
              <TimePickerInput form={form} name="dailyCheckinTime" label="Daily Standup Time" colSpan={1} />
            </FormGrid>
          </FormSection>
        ),
      },
      {
        id: "advanced",
        label: "Advanced & Composite",
        icon: Palette,
        badge: "Repeater / KV",
        children: (
          <div className="space-y-6">
            <FormSection
              title="Colors, Chips & Dynamic Dictionaries"
              description="Color picker with preset palette, tags chips, and KeyValue dictionary editor."
            >
              <FormGrid columns={{ sm: 1, md: 2 }}>
                <ColorPickerInput form={form} name="accentColor" label="Accent Brand Color" colSpan={1} />
                <TagsInput
                  form={form}
                  name="tags"
                  label="Technical Skills (TagsInput)"
                  suggestions={TAG_SUGGESTIONS}
                  colSpan={1}
                />
              </FormGrid>

              <div className="mt-4">
                <KeyValueInput
                  form={form}
                  name="metadata"
                  label="Environment Metadata (KeyValueInput - Raw Mode & Masked)"
                  helperText="Dynamic key-value pairs with dual-mode (.env & JSON raw editor), key suggestions, and secret masking."
                  keyPlaceholder="Config Key"
                  valuePlaceholder="Config Value"
                  keyLabel="Environment Key"
                  valueLabel="Configuration Value"
                  keySuggestions={["NODE_ENV", "API_BASE_URL", "DATABASE_URL", "REDIS_PORT", "AUTH_SECRET"]}
                  enableRawMode
                  masked
                />
              </div>
            </FormSection>

            <FormSection
              title="Array Subform Repeater (Card Layout)"
              description="Full-featured dynamic sub-forms with DnD-Kit reordering, collapse all, item cloning, and deletion popover."
            >
              <Repeater<{ name: string; value: string }>
                form={form}
                name="customAttributes"
                label="Custom Entity Attributes (Card Stream)"
                createItem={createDefaultAttribute}
                itemTitle={getAttributeTitle}
                addButtonText="Add Attribute Card"
                collapsible
                reorderable
                canDuplicate
                confirmDelete
                minItems={1}
                maxItems={5}
                renderItem={(item, _idx, update) => (
                  <div className="grid grid-cols-2 gap-3">
                    <TextInput
                      label="Attribute Key"
                      value={item.name}
                      onChange={(val) => update({ ...item, name: val })}
                      placeholder="e.g. Clearance"
                    />
                    <TextInput
                      label="Attribute Value"
                      value={item.value}
                      onChange={(val) => update({ ...item, value: val })}
                      placeholder="e.g. Secret"
                    />
                  </div>
                )}
              />
            </FormSection>

            <FormSection
              title="Table Subform Repeater (Compact Line Items)"
              description="Compact tabular layout with column headers, auto-calculated summary footer, and inline operations."
            >
              <Repeater<{ sku: string; description: string; quantity: number; unitPrice: number }>
                form={form}
                name="invoiceItems"
                label="Invoice Line Items (Table Layout)"
                layout="table"
                headers={[
                  { label: "SKU", width: "w-32", required: true },
                  { label: "Item Description", width: "w-1/2" },
                  { label: "Quantity", width: "w-24" },
                  { label: "Unit Price ($)", width: "w-28" },
                ]}
                createItem={createDefaultInvoiceItem}
                addButtonText="Add Invoice Line"
                reorderable
                canDuplicate
                confirmDelete
                renderSummary={(items) => {
                  const total = items.reduce(
                    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
                    0,
                  );
                  return (
                    <div className="flex items-center justify-between px-2 text-xs font-semibold">
                      <span className="text-muted-foreground">Line Items Count: {items.length}</span>
                      <span className="text-foreground">
                        Estimated Total:{" "}
                        <span className="text-primary font-mono">${total.toLocaleString()}</span>
                      </span>
                    </div>
                  );
                }}
                renderItem={(item, _idx, update) => (
                  <>
                    <td className="px-2 py-1.5 align-middle">
                      <TextInput
                        value={item.sku}
                        onChange={(val) => update({ ...item, sku: val })}
                        placeholder="SKU-..."
                        className="h-8 font-mono text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5 align-middle">
                      <TextInput
                        value={item.description}
                        onChange={(val) => update({ ...item, description: val })}
                        placeholder="Item description"
                        className="h-8 text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5 align-middle">
                      <NumberInput
                        value={item.quantity}
                        onChange={(val) => update({ ...item, quantity: Number(val) || 0 })}
                        min={1}
                        className="h-8 text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5 align-middle">
                      <NumberInput
                        value={item.unitPrice}
                        onChange={(val) => update({ ...item, unitPrice: Number(val) || 0 })}
                        min={0}
                        className="h-8 font-mono text-xs"
                      />
                    </td>
                  </>
                )}
              />
            </FormSection>
          </div>
        ),
      },
      {
        id: "media",
        label: "Media & Rich Text",
        icon: UploadCloud,
        badge: "Filament v5",
        children: (
          <div className="space-y-6">
            <FormSection
              title="Rich Text Editor (TipTap)"
              description="Full WYSIWYG rich content editor supporting bold, italic, headings, lists, blockquotes, links, and code blocks."
            >
              <LazyRichEditorInput
                form={form}
                name="articleContent"
                label="Publication Article Content"
                helperText="Supports dual output modes (HTML / Markdown). Matches Filament RichEditor toolbar and style."
                minHeight={200}
              />
            </FormSection>

            <FormSection
              title="File & Avatar Uploaders (Dropzone)"
              description="1:1 FilePond-like design with drag-and-drop, image preview thumbnails, circular avatar mode, and size validation."
            >
              <FormGrid columns={{ sm: 1, md: 3 }}>
                <FileUploadInput
                  form={form}
                  name="avatarUrl"
                  label="Profile Avatar (mode='avatar')"
                  mode="avatar"
                  accept="image/*"
                  helperText="Single image circular uploader with hover camera overlay."
                  colSpan={1}
                />
                <div className="md:col-span-2">
                  <FileUploadInput
                    form={form}
                    name="attachments"
                    label="Project Documents & Images (mode='grid')"
                    mode="grid"
                    multiple
                    maxFiles={6}
                    maxSize={5 * 1024 * 1024}
                    accept="image/*,.pdf,.zip"
                    helperText="Supports multi-file drag-and-drop, image lightbox modal, size limits, and progress bar."
                  />
                </div>
              </FormGrid>
            </FormSection>
          </div>
        ),
      },
      {
        id: "security-finance",
        label: "Security & Finance",
        icon: ShieldCheck,
        badge: "New Pro",
        children: (
          <div className="space-y-6">
            <FormSection
              title="Enterprise Authentication & Security"
              description="Password inputs with entropy meter, policy requirements checklist, CapsLock detector, and multi-slot OTP/PIN verification."
            >
              <FormGrid columns={{ sm: 1, md: 2 }}>
                <PasswordInput
                  form={form}
                  name="password"
                  label="Secure Password (PasswordInput)"
                  required
                  clearable
                  showStrength
                  placeholder="Enter high-entropy password"
                  colSpan={1}
                />
                <OtpInput
                  form={form}
                  name="twoFactorCode"
                  label="Two-Factor Verification Code (OtpInput)"
                  required
                  length={6}
                  groupSize={3}
                  colSpan={1}
                />
              </FormGrid>
            </FormSection>

            <FormSection
              title="Finance, Formats & Interactive Controls"
              description="Live thousand-separator CurrencyInput, fixed pattern MaskedInput, RatingInput, and SegmentedControl."
            >
              <FormGrid columns={{ sm: 1, md: 2 }}>
                <CurrencyInput
                  form={form}
                  name="annualSalary"
                  label="Annual Compensation (CurrencyInput)"
                  currency="USD"
                  currencySymbol="$"
                  currencies={["USD", "EUR", "GBP", "CNY"]}
                  colSpan={1}
                />
                <MaskedInput
                  form={form}
                  name="contactPhone"
                  label="Direct Phone (MaskedInput)"
                  mask="(###) ###-####"
                  unmask
                  colSpan={1}
                />
                <RatingInput
                  form={form}
                  name="ratingScore"
                  label="Product Quality Rating (RatingInput)"
                  allowHalf
                  allowClear
                  showScore
                  colSpan={1}
                />
                <SegmentedControl
                  form={form}
                  name="billingCycle"
                  label="Billing Interval (SegmentedControl)"
                  options={[
                    { label: "Monthly", value: "monthly" },
                    { label: "Quarterly", value: "quarterly" },
                    { label: "Annual", value: "annual", badge: "Save 20%" },
                  ]}
                  colSpan={1}
                />
              </FormGrid>
            </FormSection>
          </div>
        ),
      },
      {
        id: "geospatial",
        label: "Map & Location",
        icon: MapPin,
        badge: "MapLibre / Amap",
        children: (
          <div className="space-y-6">
            <FormSection
              title="Interactive Map Location Picker (FormLocationPicker)"
              description="Full-featured geographic coordinate picker built on MapLibre GL with integrated reverse geocoding, address search, coordinate system transformation, and quick presets."
            >
              <div className="space-y-4">
                <FormLocationPicker
                  form={form}
                  name="officeLocation"
                  label="Headquarters Campus (FormLocationPicker)"
                  helperText="Interactive vector map with quick city preset chips, one-click coordinate copy, reverse geocoding on drag end, and TanStack Form state synchronization."
                  required
                  height={340}
                  zoom={13}
                  showAddressSearch
                  showCoordinatesInput
                  showCopyButton
                />
              </div>
            </FormSection>

            <FormSection
              title="Custom Basemaps, Projections & Multi-CRS Configuration"
              description="Switch between coordinate systems (WGS84, GCJ02, BD09), basemap providers (Amap, Carto, OpenStreetMap, Tianditu), and toggle manual controls dynamically."
            >
              <div className="space-y-4">
                <div className="border-border/70 bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground text-xs font-medium">底图预设:</span>
                      <div className="flex items-center gap-1">
                        {BASEMAP_SELECT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setActiveBasemap(opt.value)}
                            className={cn(
                              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                              activeBasemap === opt.value
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "border border-border/60 bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground text-xs font-medium">坐标系:</span>
                      <div className="flex items-center gap-1">
                        {COORDINATE_SYSTEM_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setActiveCRS(opt.value)}
                            className={cn(
                              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                              activeCRS === opt.value
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "border border-border/60 bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <label className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={showSearch}
                        onChange={(e) => setShowSearch(e.target.checked)}
                        className="accent-primary size-3.5 rounded"
                      />
                      <span>地址搜索</span>
                    </label>
                    <label className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={showCoordsInput}
                        onChange={(e) => setShowCoordsInput(e.target.checked)}
                        className="accent-primary size-3.5 rounded"
                      />
                      <span>经纬度微调栏</span>
                    </label>
                    <label className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={isLocationDisabled}
                        onChange={(e) => setIsLocationDisabled(e.target.checked)}
                        className="accent-primary size-3.5 rounded"
                      />
                      <span>禁用表单控件</span>
                    </label>
                  </div>
                </div>

                <FormLocationPicker
                  form={form}
                  name="warehouseLocation"
                  label={`Regional Logistics Hub (Basemap: ${activeBasemap}, CRS: ${activeCRS})`}
                  helperText="Dynamically updates basemap tiles and CRS math according to interactive controls above."
                  basemap={activeBasemap}
                  coordinateSystem={activeCRS}
                  height={280}
                  zoom={11}
                  showAddressSearch={showSearch}
                  showCoordinatesInput={showCoordsInput}
                  disabled={isLocationDisabled}
                  searchPlaceholder="搜索物流仓库、中转站或地标地址..."
                />
              </div>
            </FormSection>
          </div>
        ),
      },
    ],
    [
      form,
      activeBasemap,
      activeCRS,
      showSearch,
      showCoordsInput,
      isLocationDisabled,
      asyncCategoryOptions,
      handleLoadCategoryData,
      asyncProjectTreeData,
      handleLoadProjectNodeData,
    ],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Filament v5 Form Fields & Layouts Showcase</h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Comprehensive gallery demonstrating all 20+ input controls, segmented toggles, array repeaters,
          key-value maps, geographic location pickers, and layout containers.
        </p>
      </div>

      <ResourceShowcaseSection />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormTabs tabs={tabs} />

        <div className="border-border flex items-center justify-between border-t pt-4">
          <span className="text-muted-foreground text-xs">
            Click Submit to inspect reactive form serialized output below.
          </span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              Reset Defaults
            </Button>
            <Button type="submit" size="sm" className="gap-1.5 font-semibold">
              <Send className="size-3.5" /> Submit Form
            </Button>
          </div>
        </div>
      </form>

      {submittedData && (
        <div className="border-primary/40 bg-card/60 space-y-2 rounded-xl border p-4">
          <div className="text-primary flex items-center gap-1.5 text-xs font-semibold">
            <Sparkles className="size-3.5" />
            <span>Live Form Output JSON</span>
          </div>
          <pre className="bg-muted/70 text-foreground/90 overflow-x-auto rounded-md p-3 font-mono text-[11px]">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}

      <BackToTopShowcaseCard />
    </div>
  );
}

function BackToTopShowcaseCard() {
  const localContainerRef = useRef<HTMLDivElement>(null);
  const [showProgress, setShowProgress] = useState(true);

  // 稳定引用：避免 BackToTop 内部的事件监听在每次渲染时重新订阅
  const getLocalScrollTarget = useMemoizedFn(() => localContainerRef.current);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">BackToTop 返回顶部组件交互体验</CardTitle>
            <CardDescription className="text-xs">
              支持全屏主窗口与局部可滚动容器双重场景，具备 SVG 动态进度环与平滑回滚。
            </CardDescription>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs select-none">
            <span className="text-muted-foreground">显示环形进度条</span>
            <input
              type="checkbox"
              checked={showProgress}
              onChange={(e) => setShowProgress(e.target.checked)}
              className="accent-primary size-4 cursor-pointer rounded"
            />
          </label>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <p className="bg-muted/40 text-muted-foreground rounded-md p-2.5">
          💡 <strong>全局模式提示</strong>：向下滚动当前表单页面超过
          300px，页面右下角将自动浮现带有实时滚动进度环的全局返回顶部按钮。
        </p>
        <div className="relative">
          <div className="text-foreground/80 mb-2 font-medium">
            局部容器模式演示（设置了 <code>threshold=60</code> 并绑定局部容器）：
          </div>
          <div
            ref={localContainerRef}
            className="border-border/70 bg-muted/20 relative h-44 space-y-3 overflow-y-auto rounded-lg border p-4"
          >
            {LOCAL_SCROLL_ITEMS.map((item) => (
              <div
                key={item.id}
                className="border-border/50 bg-background/80 rounded-md border p-3 shadow-xs"
              >
                <span className="text-primary font-semibold">{item.title}</span>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  这里是局部可滚动容器内容。在长列表、聊天消息流或抽屉弹窗中，通过{" "}
                  <code>target=&#123;() =&gt; containerRef.current&#125;</code> 即可让 BackToTop
                  组件精准监听并回滚至该容器顶部。
                </p>
              </div>
            ))}
            <BackToTop
              target={getLocalScrollTarget}
              threshold={60}
              showProgress={showProgress}
              className="absolute right-4 bottom-4"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
