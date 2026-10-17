import type { LocationPickerValue } from "@/components/form";

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
