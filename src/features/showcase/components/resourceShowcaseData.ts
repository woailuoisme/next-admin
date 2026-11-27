import type { ResourcePresentation } from "@/components/resource";
import { s, type SchemaNode } from "@/components/schema";

export type SampleCustomer = {
  id: string;
  name: string;
  email: string;
  company: string;
  tier: string;
  isActive: boolean;
  notes: string;
};

export const INITIAL_CUSTOMER: SampleCustomer = {
  id: "cust-9042",
  name: "Alex Morgan",
  email: "alex.morgan@acme-corp.io",
  company: "Acme Corporation",
  tier: "enterprise",
  isActive: true,
  notes: "Key strategic account with 500+ seat enterprise license renewal in Q4.",
};

export const CUSTOMER_INFOLIST_SCHEMA: readonly SchemaNode<SampleCustomer>[] = [
  s.section<SampleCustomer>({
    title: "Account Overview",
    columns: 2,
    card: true,
    schema: [
      s.entry.text("email", { label: "Primary Contact Email", copyable: true }),
      s.entry.text("company", { label: "Organization" }),
      s.entry.badge("tier", {
        label: "Subscription Tier",
        colorMap: { starter: "neutral", pro: "info", enterprise: "primary" },
        labelMap: { starter: "Starter", pro: "Professional", enterprise: "Enterprise Scale" },
      }),
      s.entry.badge("isActive", {
        label: "Account Status",
        resolveValue: ({ record }) => (record?.isActive ? "operational" : "suspended"),
        colorMap: { operational: "success", suspended: "destructive" },
        labelMap: { operational: "Operational", suspended: "Suspended" },
      }),
    ],
  }),
  s.entry.callout({
    color: "info",
    title: "Strategic Account Notes",
    description: "Long-term account summary and renewal reminders synchronized with CRM.",
  }),
  s.section<SampleCustomer>({
    card: false,
    columns: 1,
    schema: [s.entry.text("notes", { label: "Account Notes" })],
  }),
];

export const TIER_OPTIONS = [
  { label: "Starter", value: "starter" },
  { label: "Professional", value: "pro" },
  { label: "Enterprise Scale", value: "enterprise" },
];

export const SHOWCASE_ACCENT_CLASSES = {
  success: "text-chart-2",
  info: "text-primary",
  warning: "text-chart-4",
  successText: "text-chart-2",
  successBorder: "border-chart-2/30",
} as const;

export function buildCustomerSampleCode(presentation: ResourcePresentation): string {
  return `// 1. 在领域 ui.tsx 中声明 UI Schema（形态由 resource.presentation="${presentation}" 托管）
export const customerUI = defineResourceUI(customerResource, {
  headerActions: () => [action.import(...), action.export(), action.create()],
  table: {
    columns: ({ t }) => [...],
    rowActions: () => [action.view(), action.edit(), action.group([action.replicate(), action.delete()])],
    batchActions: () => [action.export(), action.batchDelete()],
  },
  form: { schema: [...] },
  infolist: { render: ({ entity }) => <CustomerInfolist customer={entity} /> },
});

// 2. 导出零胶水视图并在 App Router page.tsx 中绑定
export const CustomersListView = customerUI.ListView;`;
}
