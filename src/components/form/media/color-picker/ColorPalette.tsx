import { Palette } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { ColorPaletteProps } from "./types";

export const ColorPalette = memo(function ColorPalette({
  presets,
  activeColor,
  onSelect,
  disabled,
}: ColorPaletteProps) {
  if (!presets || presets.length === 0) return null;

  const normalizedActive = activeColor.toLowerCase();

  return (
    <div className="space-y-1.5">
      <div className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
        <Palette className="size-3" />
        <span>预设色彩</span>
      </div>
      <div className="grid grid-cols-6 gap-1.5" role="listbox" aria-label="预设色彩选择">
        {presets.map((color) => {
          const isSelected = normalizedActive === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              role="option"
              aria-selected={isSelected}
              aria-label={`选择颜色 ${color}`}
              disabled={disabled}
              onClick={() => onSelect(color)}
              className={cn(
                "size-6 cursor-pointer rounded-md border border-border/70 shadow-2xs transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                isSelected && "ring-2 ring-primary ring-offset-1",
              )}
              style={{ backgroundColor: color }}
            />
          );
        })}
      </div>
    </div>
  );
});
