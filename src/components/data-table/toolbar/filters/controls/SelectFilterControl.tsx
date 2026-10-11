import React from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { DataTableFilterDefinition } from "../../../core/types";

export interface SelectFilterControlProps {
  definition: Extract<DataTableFilterDefinition, { type: "select" }>;
  value: any;
  onChange: (val: string) => void;
  ariaLabel?: string;
}

export const SelectFilterControl: React.FC<SelectFilterControlProps> = ({
  definition,
  value,
  onChange,
  ariaLabel,
}) => {
  return (
    <Select value={String(value ?? "__all__")} onValueChange={onChange}>
      <SelectTrigger className="bg-background h-8 text-xs" aria-label={ariaLabel}>
        <SelectValue placeholder={definition.placeholder ?? "All"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__" className="text-muted-foreground text-xs font-medium">
          - (All)
        </SelectItem>
        {definition.options.map((opt) => (
          <SelectItem key={String(opt.value)} value={String(opt.value)} className="text-xs">
            <div className="flex w-full items-center justify-between gap-3">
              <span>{opt.label}</span>
              {opt.badge !== undefined && (
                <span className="bg-muted text-muted-foreground rounded-sm px-1.5 py-0.5 font-mono text-[10px]">
                  {opt.badge}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
