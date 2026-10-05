"use client";

import { Check, Laptop, Moon, Palette, Sliders, Sparkles, Sun } from "lucide-react";
import { useState } from "react";

import { GlitchTipDiagnostic } from "@/components/glitch-tip-diagnostic";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RADIUS_OPTIONS, type ThemeColor, usePreferencesStore } from "@/stores/preferences";

export function ThemeColorPicker() {
  const {
    theme,
    setTheme,
    themes,
    radius,
    setRadius,
    activeThemeMeta,
    mode,
    setMode,
    resolvedMode,
  } = usePreferencesStore();

  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-muted hover:text-foreground relative h-8 w-8 cursor-pointer rounded-lg"
              aria-label="主题与外观设置"
            >
              <Palette className="h-4 w-4" />
              {/* Small colored badge dot indicating active theme */}
              <span
                className="border-background absolute right-1 bottom-1 h-2 w-2 rounded-full border shadow-xs"
                style={{ backgroundColor: activeThemeMeta.primaryColor }}
              />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          主题与外观定制 ({activeThemeMeta.name})
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="border-border/80 bg-background/95 w-80 rounded-xl p-4 shadow-xl backdrop-blur-md transition-all duration-200"
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="border-border/50 flex items-center justify-between border-b pb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="text-primary h-4 w-4" />
              <h4 className="text-foreground text-xs font-semibold tracking-tight">
                外观与主题 (Theme & Appearance)
              </h4>
            </div>
          </div>

          {/* 1. Theme Presets Grid (6 themes, default first) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
                <Sliders className="h-3 w-3" />
                预设主题调色盘
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {themes.map((item) => {
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTheme(item.id as ThemeColor);
                    }}
                    className={cn(
                      "group flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-2 text-left transition-all duration-150",
                      isSelected
                        ? "border-primary/80 bg-primary/10 shadow-xs ring-1 ring-primary/30"
                        : "border-border/60 hover:border-border hover:bg-muted/50",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {/* Double-circle color swatches */}
                      <div
                        className="border-border/60 relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full border shadow-2xs transition-transform group-hover:scale-105"
                        style={{ backgroundColor: item.primaryColor }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full shadow-inner"
                          style={{ backgroundColor: item.accentColor }}
                        />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span
                          className={cn(
                            "truncate text-[11px] leading-tight font-semibold",
                            isSelected ? "font-bold text-foreground" : "text-foreground/90",
                          )}
                        >
                          {item.name}
                        </span>
                        <span className="text-muted-foreground truncate font-mono text-[9px]">
                          {item.nameEn}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="animate-in text-primary zoom-in-50 h-3 w-3 shrink-0 duration-150" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Mode Adjustment (Light / Dark / System Auto) */}
          <div className="border-border/40 space-y-1.5 border-t pt-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
                <Sun className="h-3 w-3" />
                界面模式 (Appearance Mode)
              </span>
              <span className="text-muted-foreground font-mono text-[10px]">
                {mode === "auto"
                  ? `系统 (${resolvedMode === "dark" ? "深色" : "浅色"})`
                  : mode === "dark"
                    ? "深色"
                    : "浅色"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setMode("light")}
                className={cn(
                  "flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-lg border text-[11px] transition-all",
                  mode === "light"
                    ? "border-primary bg-primary/10 font-semibold text-primary shadow-xs"
                    : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>浅色</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("dark")}
                className={cn(
                  "flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-lg border text-[11px] transition-all",
                  mode === "dark"
                    ? "border-primary bg-primary/10 font-semibold text-primary shadow-xs"
                    : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>深色</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("auto")}
                className={cn(
                  "flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-lg border text-[11px] transition-all",
                  mode === "auto"
                    ? "border-primary bg-primary/10 font-semibold text-primary shadow-xs"
                    : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>系统</span>
              </button>
            </div>
          </div>

          {/* 3. Radius Adjustment */}
          <div className="border-border/40 space-y-1.5 border-t pt-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-medium">
                界面圆角 (Radius)
              </span>
              <span className="text-muted-foreground font-mono text-[10px]">{radius}</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {RADIUS_OPTIONS.map((opt) => {
                const isRadiusActive = radius === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRadius(opt.value)}
                    className={cn(
                      "flex h-6 cursor-pointer items-center justify-center rounded border font-mono text-[10px] transition-all",
                      isRadiusActive
                        ? "border-primary bg-primary font-semibold text-primary-foreground shadow-xs"
                        : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {opt.value}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. GlitchTip 异常监控诊断 */}
          <GlitchTipDiagnostic />

          {/* Footer */}
          <div className="border-border/40 text-muted-foreground flex items-center justify-between border-t pt-2 text-[10px]">
            <span>
              配色：{activeThemeMeta.name} ·{" "}
              {mode === "auto" ? "跟随系统" : mode === "dark" ? "深色" : "浅色"}
            </span>
            <span className="text-muted-foreground/80 font-mono text-[9px]">圆角：{radius}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
