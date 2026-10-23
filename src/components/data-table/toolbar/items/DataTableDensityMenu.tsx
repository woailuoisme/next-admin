import { useTranslations } from "next-intl";
import { Check, SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";

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

export function DataTableDensityMenu({ density = "standard", onDensityChange = () => {} }: DataTableDensityMenuProps) {
  const t = useTranslations("table");

  const densityOptions = useMemo<Array<{ value: DataTableDensity; label: string }>>(
    () => [
      { value: "compact", label: t("density_compact") },
      { value: "standard", label: t("density_standard") },
      { value: "comfortable", label: t("density_comfortable") },
    ],
    [t],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs">
          <SlidersHorizontal className="size-3.5" />
          <span>{t("density_button")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-36">
        <DropdownMenuLabel className="text-xs">{t("density_title")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {densityOptions.map((opt) => (
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
