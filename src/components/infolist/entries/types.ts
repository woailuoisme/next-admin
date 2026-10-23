import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import type { EntryBaseProps } from "../core/types";

export type EntrySemanticColor = "primary" | "secondary" | "success" | "warning" | "destructive" | "info" | "neutral";

export interface TextEntryProps extends EntryBaseProps {
  /** Explicit value or taken from record */
  value?: any;
  /** Format type */
  format?: "text" | "badge" | "currency" | "number" | "date" | "url" | "email" | "phone";
  /** Semantic color for badges */
  color?: EntrySemanticColor;
  /** Currency symbol or ISO code, default 'USD' */
  currency?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Date format string or options */
  dateOptions?: Intl.DateTimeFormatOptions;
  /** Prefix content/text */
  prefix?: React.ReactNode;
  /** Suffix content/text */
  suffix?: React.ReactNode;
  /** Provide copy button */
  copyable?: boolean | string;
  /** Fallback text when empty/null/undefined */
  placeholder?: React.ReactNode;
  /** Link href if clickable */
  href?: string;
  /** Target blank for links */
  openInNewTab?: boolean;
}

export interface IconEntryProps extends EntryBaseProps {
  /** Explicit value or boolean from record */
  value?: boolean | string | number | null;
  /** Semantic color */
  color?: EntrySemanticColor;
  /** Custom icon */
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  /** Icon mapping for boolean or string states */
  iconMap?: Record<string, LucideIcon | React.ComponentType<{ className?: string }>>;
  /** Color mapping */
  colorMap?: Record<string, EntrySemanticColor>;
  /** Label text next to the icon */
  text?: React.ReactNode;
  /** Fallback placeholder if null/undefined */
  placeholder?: React.ReactNode;
}

export interface ImageEntryProps extends EntryBaseProps {
  /** Explicit image URL or array of URLs */
  value?: string | string[] | null;
  /** Alt text description */
  alt?: string;
  /** Shape: circular, rounded, square */
  shape?: "circular" | "rounded" | "square";
  /** Size: sm (32px), md (48px), lg (64px), xl (96px) */
  size?: "sm" | "md" | "lg" | "xl";
  /** Enable lightbox on click */
  lightbox?: boolean;
  /** Fallback image / placeholder */
  fallback?: React.ReactNode;
}

export interface ColorEntryProps extends EntryBaseProps {
  /** Color hex or rgb string */
  value?: string | null;
  /** Show color text */
  showText?: boolean;
  /** Allow copying color value */
  copyable?: boolean;
  /** Fallback placeholder */
  placeholder?: React.ReactNode;
}

export interface CodeEntryProps extends EntryBaseProps {
  /** Code or JSON object */
  value?: any;
  /** Language identifier */
  language?: string;
  /** Pretty print JSON with indentation */
  formatJson?: boolean;
  /** Allow copying code */
  copyable?: boolean;
  /** Max height container class */
  maxHeight?: string;
  /** Fallback placeholder */
  placeholder?: React.ReactNode;
}

export interface KeyValueEntryProps extends EntryBaseProps {
  /** Object map or array of { key, value } */
  value?: Record<string, any> | Array<{ key: string; value: any }> | null;
  /** Layout variant: list or table */
  variant?: "list" | "table";
  /** Fallback placeholder */
  placeholder?: React.ReactNode;
}

export interface RepeatableEntryProps<T = any> extends EntryBaseProps {
  /** Array of items */
  value?: T[] | null;
  /** Layout variant: card, grid, table */
  variant?: "card" | "grid" | "table";
  /** Columns count for grid variant */
  gridCols?: 1 | 2 | 3 | 4;
  /** Render item title / header */
  itemTitle?: (item: T, index: number) => React.ReactNode;
  /** Width class for the item title column in table variant (default: 'w-64 sm:w-80') */
  itemTitleWidth?: string;
  /** Optional column headers for table variant */
  tableHeaders?: React.ReactNode[];
  /** Whether cards are collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Empty state description */
  emptyHeading?: string;
  emptyDescription?: string;
  /** Render function for each item */
  children: (item: T, index: number) => React.ReactNode;
}
