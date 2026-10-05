import { Check, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { DataTableDensity } from "../../core/types";
import type { DataTableDensityMenuProps } from "../types";

const DENSITY_OPTIONS: Array<{ value: DataTableDensity; label: string }> = [
  { value: "compact", label: "Compact" },
  { value: "standard", label: "Standard" },
  { value: "comfortable", label: "Comfortable" },
];

export function DataTableDensityMenu({
  density = "standard",
  onDensityChange = () => {},
}: DataTableDensityMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs"
        >
          <SlidersHorizontal className="size-3.5" />
          <span>Density</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-36">
        <DropdownMenuLabel className="text-xs">Row Height</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DENSITY_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onDensityChange(opt.value)}
            className="flex items-center justify-between text-xs"
          >
            <span>{opt.label}</span>
            {density === opt.value && <Check className="text-primary size-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
