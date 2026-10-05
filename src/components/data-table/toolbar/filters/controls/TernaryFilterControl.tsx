import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { DataTableFilterDefinition } from "../../../core/types";

export interface TernaryFilterControlProps {
  definition: Extract<DataTableFilterDefinition, { type: "ternary" }>;
  value: any;
  onChange: (val: string) => void;
  ariaLabel?: string;
}

export const TernaryFilterControl: React.FC<TernaryFilterControlProps> = ({
  definition,
  value,
  onChange,
  ariaLabel,
}) => {
  return (
    <Select value={String(value ?? "__all__")} onValueChange={onChange}>
      <SelectTrigger className="bg-background h-8 text-xs" aria-label={ariaLabel}>
        <SelectValue placeholder={definition.placeholder ?? "-"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__" className="text-muted-foreground text-xs font-medium">
          -
        </SelectItem>
        <SelectItem value="true" className="text-xs">
          {definition.trueLabel ?? "Yes"}
        </SelectItem>
        <SelectItem value="false" className="text-xs">
          {definition.falseLabel ?? "No"}
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
