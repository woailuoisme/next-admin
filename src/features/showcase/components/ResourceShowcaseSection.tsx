import { useForm } from "@tanstack/react-form";
import { useMemoizedFn } from "ahooks";
import { BadgeCheck, Check, Code2, Copy, Eye, Layers, Pencil, Plus, Sparkles } from "lucide-react";
import { memo, useState } from "react";
import { toast } from "sonner";

import { FormGrid, SelectInput, SwitchInput, TextInput } from "@/components/form";
import {
  ResourceFormHost,
  type ResourcePresentation,
  ResourceViewHost,
  useResourceOperations,
} from "@/components/resource";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SampleCustomer {
  id: string;
  name: string;
  email: string;
  company: string;
  tier: string;
  isActive: boolean;
  notes: string;
}

const INITIAL_CUSTOMER: SampleCustomer = {
  id: "cust-9042",
  name: "Alex Morgan",
  email: "alex.morgan@acme-corp.io",
  company: "Acme Corporation",
  tier: "enterprise",
  isActive: true,
  notes: "Key strategic account with 500+ seat enterprise license renewal in Q4.",
};

/** 订阅等级可选项（纯静态） */
const TIER_OPTIONS = [
  { label: "Starter", value: "starter" },
  { label: "Professional", value: "pro" },
  { label: "Enterprise Scale", value: "enterprise" },
];

/**
 * 页面 chrome 状态配色（业务功能色统一收敛于此表）
 */
const SHOWCASE_ACCENT_CLASSES = {
  success: "text-emerald-500",
  info: "text-sky-500",
  warning: "text-amber-500",
  successText: "text-emerald-600 dark:text-emerald-400",
} as const;

export const ResourceShowcaseSection = memo(function ResourceShowcaseSection() {
  const [presentation, setPresentation] = useState<ResourcePresentation>("dialog");
  const [customer, setCustomer] = useState<SampleCustomer>(INITIAL_CUSTOMER);
  const [copied, setCopied] = useState(false);

  // Unified operations controller
  const ops = useResourceOperations<SampleCustomer>({
    presentation,
    onCreate: () => {
      toast.info(`Triggered Create operation in [${presentation}] presentation mode`);
    },
    onEdit: (id) => {
      toast.info(`Triggered Edit operation for #${id} in [${presentation}] mode`);
    },
    onView: (id) => {
      toast.info(`Triggered View operation for #${id} in [${presentation}] mode`);
    },
  });

  // 新建客户的默认值：随机 id 只在挂载时生成一次，避免每次渲染都执行 Math.random()
  const [newCustomerDefaults] = useState<SampleCustomer>(() => ({
    id: `cust-${Math.floor(1000 + Math.random() * 9000)}`,
    name: "",
    email: "",
    company: "",
    tier: "pro",
    isActive: true,
    notes: "",
  }));

  // Form instance for Create/Edit
  const form = useForm({
    defaultValues: ops.editId ? customer : newCustomerDefaults,
    onSubmit: async ({ value }) => {
      await new Promise((r) => setTimeout(r, 600));
      setCustomer(value as SampleCustomer);
      toast.success(
        ops.editId
          ? "Customer details updated successfully!"
          : "New customer record created successfully!",
      );
      ops.closeFormDialog();
    },
  });

  const handleCopyCode = useMemoizedFn(() => {
    const sampleCode = `// Filament v5 风格：一行配置即可在 弹窗 / 抽屉 / 独立页面 自由切换
const ops = useResourceOperations<Customer>({
  basePath: "/customers",
  presentation: "${presentation}", // "dialog" | "drawer" | "page"
  syncWithUrl: true,
});

return (
  <ResourceFormHost
    presentation={ops.createPresentation}
    open={ops.isCreateOpen}
    onOpenChange={ops.closeCreate}
    title="Create Customer"
    onSubmit={form.handleSubmit}
  >
    <CustomerForm form={form} />
  </ResourceFormHost>
);`;
    navigator.clipboard.writeText(sampleCode);
    setCopied(true);
    toast.success("Code snippet copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  });

  return (
    <Card className="border-border/70 overflow-hidden shadow-xs">
      <CardHeader className="border-border/60 bg-muted/20 border-b pb-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-lg">
                <Layers className="size-4" />
              </span>
              <CardTitle className="text-base font-semibold">
                Filament v5 工业级 Resource CRUD 宿主架构
              </CardTitle>
              <Badge variant="outline" className="border-primary/30 text-primary text-[11px]">
                Dialog · Drawer · Page
              </Badge>
            </div>
            <CardDescription className="mt-1 text-xs">
              对标 Laravel Filament v5 体系设计。同一套表单和详情视图，支持在居中模态框
              (Dialog)、右侧滑动抽屉 (Drawer/SlideOver) 与独立路由页面 (Page)
              三种工业级形态之间零成本无缝切换。
            </CardDescription>
          </div>

          {/* Presentation Selector */}
          <div className="border-border/70 bg-background/80 flex items-center gap-1.5 rounded-lg border p-1 shadow-xs">
            {(
              [
                { key: "dialog", label: "🪟 Dialog (弹窗)" },
                { key: "drawer", label: "📑 Drawer (抽屉)" },
                { key: "page", label: "📄 Page (独立页)" },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPresentation(item.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  presentation === item.key
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Trigger Buttons Toolbar */}
        <div className="border-border/60 bg-muted/15 flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="text-foreground text-sm font-medium">
              当前演示形态：
              <span className="text-primary ml-1 font-semibold capitalize">
                {presentation} Mode
              </span>
            </div>
            <div className="text-muted-foreground text-xs">
              点击下方操作按钮，直接预览在当前形态下唤起的表单与详情视图：
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              size="sm"
              onClick={() => ops.openCreate()}
              className="h-8.5 gap-1.5 text-xs shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>新建客户 (Create)</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => ops.openEdit(customer.id)}
              className="h-8.5 gap-1.5 text-xs shadow-xs"
            >
              <Pencil className="size-3.5" />
              <span>编辑客户 (Edit)</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => ops.openView(customer.id)}
              className="h-8.5 gap-1.5 text-xs shadow-xs"
            >
              <Eye className="size-3.5" />
              <span>查看详情 (View)</span>
            </Button>
          </div>
        </div>

        {/* Architecture Value Pillars */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="border-border/60 bg-card space-y-2 rounded-lg border p-4">
            <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
              <BadgeCheck className={`size-4 shrink-0 ${SHOWCASE_ACCENT_CLASSES.success}`} />
              <span>100% 视图与逻辑零冗余复用</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              表单控件、校验规则、提交变更与详情展示结构只需定义一次。无论嵌入弹窗、滑出抽屉还是全屏路由，UI
              与状态机完全同构。
            </p>
          </div>

          <div className="border-border/60 bg-card space-y-2 rounded-lg border p-4">
            <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
              <BadgeCheck className={`size-4 shrink-0 ${SHOWCASE_ACCENT_CLASSES.info}`} />
              <span>双轨路由与搜索参数自动适配</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              弹窗/抽屉自动同步 <code>?create=true</code> 与 <code>?editId=xxx</code>
              （支持浏览器前进后退与协作分享）；页面模式自动调用路由跳转。
            </p>
          </div>

          <div className="border-border/60 bg-card space-y-2 rounded-lg border p-4">
            <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
              <BadgeCheck className={`size-4 shrink-0 ${SHOWCASE_ACCENT_CLASSES.warning}`} />
              <span>吸底操作栏与未保存拦截守卫</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              包含 Filament
              标志性的“保存并继续编辑”操作、页面离开前未保存修改脏检查警告，以及负外边距中和与精确滚动穿透控制。
            </p>
          </div>
        </div>

        {/* Page Mode In-place Preview / Information Box */}
        {presentation === "page" ? (
          <div className="border-primary/30 bg-primary/5 space-y-3 rounded-xl border-2 border-dashed p-4">
            <div className="flex items-center justify-between">
              <div className="text-primary flex items-center gap-2 text-xs font-semibold">
                <Sparkles className="size-4" />
                <span>Page 模式运行机制</span>
              </div>
              <Badge variant="outline" className="border-primary/40 bg-background text-[10px]">
                Full Route Page
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              在生产项目中，Page 模式通常直接映射到独立路由页面（如{" "}
              <code>/_authenticated/customers/create</code> 或{" "}
              <code>/_authenticated/customers/$id/edit</code>）。 下方已就地挂载完整的{" "}
              <code>ResourceFormPage</code> 与 <code>ResourceViewPage</code>{" "}
              预览容器，真实展示面包屑导航、返回按钮、表单主体以及底部吸底操作条：
            </p>
          </div>
        ) : null}

        {/* Code Usage Snippet */}
        <div className="border-border/60 bg-muted/40 relative rounded-lg border p-4 font-mono text-xs">
          <div className="border-border/50 text-muted-foreground flex items-center justify-between border-b pb-2 text-[11px]">
            <span className="flex items-center gap-1.5">
              <Code2 className="size-3.5" />
              <span>标准业务集成范例 (Resource Form / View Host)</span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleCopyCode}
              className="h-6 w-6"
            >
              {copied ? (
                <Check className={`size-3 ${SHOWCASE_ACCENT_CLASSES.success}`} />
              ) : (
                <Copy className="size-3" />
              )}
            </Button>
          </div>
          <pre className="text-foreground overflow-x-auto pt-3 text-[11px] leading-relaxed">
            {`// 1. 在业务 Page 或 Feature 中定义统一调度器
const ops = useResourceOperations<Customer>({
  basePath: "/customers",
  presentation: "${presentation}", // "dialog" | "drawer" | "page"
  syncWithUrl: true,
});

// 2. 挂载宿主容器（表单与详情视图根据当前 presentation 自动渲染对应形态）
<ResourceFormHost
  presentation={ops.createPresentation}
  open={ops.isCreateOpen}
  onOpenChange={ops.closeCreate}
  title="Create Customer"
  onSubmit={form.handleSubmit}
>
  <CustomerFormFields form={form} />
</ResourceFormHost>`}
          </pre>
        </div>
      </CardContent>

      {/* Form Host Modal/Drawer/Page Container */}
      <ResourceFormHost
        presentation={presentation}
        open={ops.isCreateOpen || ops.isEditOpen}
        onOpenChange={(next) => {
          if (!next) ops.closeFormDialog();
        }}
        title={ops.isCreateOpen ? "Create Customer" : `Edit ${customer.name}`}
        description="Manage organization customer records and enterprise account settings."
        badge={
          <Badge variant="secondary" className="text-[10px]">
            {customer.tier.toUpperCase()}
          </Badge>
        }
        size="lg"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Customers", href: "/customers" },
          { label: ops.isCreateOpen ? "Create" : "Edit", active: true },
        ]}
        backTo={() => ops.closeFormDialog()}
        backLabel="Return to showcase"
        submitText={ops.isCreateOpen ? "Create Customer" : "Save Changes"}
        saveAndContinueText="Save & Continue Editing"
        onSaveAndContinue={async () => {
          await form.handleSubmit();
          toast.info("Saved! Ready for continued editing.");
        }}
        onSubmit={() => form.handleSubmit()}
        onCancel={() => ops.closeFormDialog()}
      >
        {/* ResourceFormHost/FormDialog 已拥有 form 元素并接管提交，此处严禁再嵌套 form */}
        <div className="space-y-4">
          <FormGrid columns={2}>
            <form.Field name="name">
              {(field) => (
                <TextInput
                  label="Customer Name"
                  required
                  value={field.state.value}
                  onChange={(val) => field.handleChange(String(val))}
                  placeholder="e.g. Acme Corporation"
                />
              )}
            </form.Field>
            <form.Field name="email">
              {(field) => (
                <TextInput
                  label="Contact Email"
                  required
                  type="email"
                  value={field.state.value}
                  onChange={(val) => field.handleChange(String(val))}
                  placeholder="contact@company.com"
                />
              )}
            </form.Field>
          </FormGrid>

          <FormGrid columns={2}>
            <form.Field name="company">
              {(field) => (
                <TextInput
                  label="Organization / Company"
                  value={field.state.value}
                  onChange={(val) => field.handleChange(String(val))}
                  placeholder="Company name"
                />
              )}
            </form.Field>
            <form.Field name="tier">
              {(field) => (
                <SelectInput
                  label="Subscription Tier"
                  value={field.state.value}
                  onChange={(val) => field.handleChange(String(val))}
                  options={TIER_OPTIONS}
                />
              )}
            </form.Field>
          </FormGrid>

          <form.Field name="notes">
            {(field) => (
              <TextInput
                label="Account Notes"
                value={field.state.value}
                onChange={(val) => field.handleChange(String(val))}
                placeholder="Strategic notes, renewal reminders..."
              />
            )}
          </form.Field>

          <form.Field name="isActive">
            {(field) => (
              <SwitchInput
                label="Active Account Status"
                helperText="Enable or suspend organization access to platform workspace."
                value={Boolean(field.state.value)}
                onChange={(checked) => field.handleChange(checked)}
              />
            )}
          </form.Field>
        </div>
      </ResourceFormHost>

      {/* View Host Modal/Drawer/Page Container */}
      <ResourceViewHost
        presentation={presentation}
        open={ops.isViewOpen}
        onOpenChange={(next) => {
          if (!next) ops.closeView();
        }}
        title={customer.name}
        description={`Customer ID: ${customer.id}`}
        badge={
          <Badge
            variant="outline"
            className={`border-emerald-500/30 text-[10px] ${SHOWCASE_ACCENT_CLASSES.successText}`}
          >
            ACTIVE ENTERPRISE
          </Badge>
        }
        size="lg"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Customers", href: "/customers" },
          { label: customer.name, active: true },
        ]}
        backTo={() => ops.closeView()}
        backLabel="Return to showcase"
        onEdit={() => {
          ops.closeView();
          ops.openEdit(customer.id);
        }}
        editText="Edit Customer"
        closeText="Close View"
      >
        <div className="space-y-4">
          <div className="border-border/60 bg-muted/20 grid grid-cols-2 gap-4 rounded-xl border p-4">
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">
                Primary Contact Email
              </div>
              <div className="text-foreground mt-0.5 text-sm font-semibold">{customer.email}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">Organization</div>
              <div className="text-foreground mt-0.5 text-sm font-semibold">{customer.company}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">Subscription Tier</div>
              <div className="text-foreground mt-0.5 text-sm font-semibold capitalize">
                {customer.tier}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">Account Status</div>
              <div
                className={`mt-0.5 text-sm font-semibold ${SHOWCASE_ACCENT_CLASSES.successText}`}
              >
                {customer.isActive ? "Operational" : "Suspended"}
              </div>
            </div>
          </div>

          <div className="border-border/60 bg-muted/10 space-y-1 rounded-xl border p-4">
            <div className="text-muted-foreground text-[11px] font-medium">
              Strategic Account Notes
            </div>
            <p className="text-foreground/90 text-xs leading-relaxed">{customer.notes}</p>
          </div>
        </div>
      </ResourceViewHost>
    </Card>
  );
});
