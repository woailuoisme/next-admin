import type * as React from "react";

import type { ColSpan } from "@/components/shared/grid";

export type { ColSpan };

export type EntryOrientation = "vertical" | "horizontal";

export interface EntryBaseProps {
  /** Field name in the Infolist record context */
  name?: string;
  /** Label displayed above or beside the entry */
  label?: React.ReactNode;
  /** Subtle hint text next to label */
  hint?: React.ReactNode;
  /** Informational tooltip icon with popup */
  tooltip?: React.ReactNode;
  /** Helper description text underneath the value */
  helperText?: React.ReactNode;
  /** Conditional rendering flag */
  hidden?: boolean;
  /** Grid column span */
  colSpan?: ColSpan;
  /** Orientation: vertical (stacked) or horizontal (inline label) */
  inline?: boolean;
  /** Custom class names */
  className?: string;
  labelClassName?: string;
  contentClassName?: string;
}

export interface EntryWrapperProps extends EntryBaseProps {
  children?: React.ReactNode;
}

export interface InfolistConfigValue {
  orientation: EntryOrientation;
  dense: boolean;
}

export interface InfolistContextValue<TRecord = unknown> {
  record?: TRecord;
  orientation?: EntryOrientation;
  dense?: boolean;
}

export interface InfolistProps<TRecord = unknown> extends React.HTMLAttributes<HTMLDivElement> {
  record?: TRecord;
  orientation?: EntryOrientation;
  dense?: boolean;
  children?: React.ReactNode;
}
