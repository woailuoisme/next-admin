import { memo, type ReactNode } from "react";

import { FieldLegend, FieldSet } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import type { GridColumns } from "../core";

import { FormGrid } from "./FormGrid";

export interface FormFieldsetProps {
  legend?: ReactNode;
  columns?: GridColumns;
  className?: string;
  children: ReactNode;
}

export const FormFieldset = memo(function FormFieldset({ legend, columns, className, children }: FormFieldsetProps) {
  return (
    <FieldSet
      className={cn(
        "w-full rounded-xl border border-border/70 bg-card/30 p-4 pt-2.5 text-left transition-colors",
        className,
      )}
    >
      {legend && (
        <FieldLegend className="text-foreground px-2 text-xs font-semibold tracking-tight">{legend}</FieldLegend>
      )}
      <div className="w-full pt-1.5">{columns ? <FormGrid columns={columns}>{children}</FormGrid> : children}</div>
    </FieldSet>
  );
});
