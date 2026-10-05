import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import type { ColSpan } from "../core/types";

export type CalloutColor = "primary" | "info" | "success" | "warning" | "destructive" | "neutral";

export interface CalloutAction {
  label: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "xs";
  icon?: LucideIcon | React.ReactNode;
  external?: boolean;
}

export interface CalloutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Callout semantic color variant */
  color?: CalloutColor;
  /** Main heading title */
  title?: React.ReactNode;
  /** Detailed content description */
  description?: React.ReactNode;
  /** Custom icon override or false to hide */
  icon?: LucideIcon | React.ReactNode | false;
  /** Compact inline single-line layout */
  compact?: boolean;
  /** Whether the callout can be closed/dismissed by user */
  dismissible?: boolean;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Action buttons or links */
  actions?: CalloutAction[];
  /** Custom colSpan if used inside an Infolist or Grid */
  colSpan?: ColSpan;
  /** Additional children */
  children?: React.ReactNode;
}
