"use client";

import { useLocale, useTranslations } from "next-intl";

import { Check, Laptop, Moon, Palette, Sliders, Sparkles, Sun } from "lucide-react";
import { memo, useState } from "react";
import { cn } from "cn";

import { GlitchTipDiagnostic } from "@/components/shared/GlitchTipDiagnostic";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  RADIUS_OPTIONS,
  useActiveThemeMeta,
  usePreferencesStore,
  useResolvedThemeMode,
  useTheme,
  useThemeMode,
  useThemeRadius,
} from "@/stores/preferences";

export interface ThemeColorPickerProps {
  className?: string;

  title?: string;
  ariaLabel?: string;
}

const MODE_OPTIONS = [
  { mode: "light" as const, labelKey: "theme_mode_light" as const, Icon: Sun },
  { mode: "dark" as const, labelKey: "theme_mode_dark" as const, Icon: Moon },
  { mode: "auto" as const, labelKey: "theme_mode_system" as const, Icon: Laptop },
];

const ThemePickerPopoverContent = memo(function ThemePickerPopoverContent({ title }: { title?: string }) {
  const t = useTranslations("shared");
  const ctxLocale = useLocale();
  const theme = useTheme();
  const mode = useThemeMode();
  const resolvedMode = useResolvedThemeMode();
  const radius = useThemeRadius();
  const activeThemeMeta = useActiveThemeMeta();
  const themes = usePreferencesStore((s) => s.themes);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const setMode = usePreferencesStore((s) => s.setMode);
  const setRadius = usePreferencesStore((s) => s.setRadius);

  const activeThemeName = ctxLocale === "en" ? (activeThemeMeta.nameEn ?? activeThemeMeta.name) : activeThemeMeta.name;
  const currentModeText =
    mode === "auto" ? t("theme_mode_system") : mode === "dark" ? t("theme_mode_dark") : t("theme_mode_light");

  const activeModeDisplayText =
    mode === "auto"
      ? `${t("theme_mode_system")} (${resolvedMode === "dark" ? t("theme_mode_dark") : t("theme_mode_light")})`
      : currentModeText;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-border/50 flex items-center justify-between border-b pb-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="text-primary size-4" />
          <h4 className="text-foreground text-xs font-semibold tracking-tight">{title ?? t("theme_title")}</h4>
        </div>
      </div>

      {/* 1. Theme Presets Grid (6 themes, default first) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
            <Sliders className="size-3" />
            {t("theme_palette_title")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {themes.map((item) => {
            const isSelected = theme === item.id;
            return (
              <Button
                key={item.id}
                type="button"
                variant="outline"
                aria-pressed={isSelected}
                onClick={() => setTheme(item.id)}
                className={cn(
                  "group h-auto cursor-pointer items-center justify-between gap-2 rounded-lg border p-2 text-left transition-all duration-150",
                  isSelected
                    ? "border-primary/80 bg-primary/10 shadow-xs ring-1 ring-primary/30 hover:bg-primary/15"
                    : "border-border/60 hover:border-border hover:bg-muted/50",
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  {/* Double-circle color swatches */}
                  <div
                    className="border-border/60 relative flex size-4 shrink-0 items-center justify-center rounded-full border shadow-2xs transition-transform group-hover:scale-105"
                    style={{ backgroundColor: item.primaryColor }}
                  >
                    <span
                      className="size-1.5 rounded-full shadow-inner"
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
                    <span className="text-muted-foreground truncate font-mono text-[9px]">{item.nameEn}</span>
                  </div>
                </div>
                {isSelected && <Check className="animate-in text-primary zoom-in-50 size-3 shrink-0 duration-150" />}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 2. Mode Adjustment (Light / Dark / System Auto) */}
      <div className="border-border/40 space-y-1.5 border-t pt-1">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
            <Sun className="size-3" />
            {t("theme_mode_title")}
          </span>
          <span className="text-muted-foreground font-mono text-[10px]">{activeModeDisplayText}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {MODE_OPTIONS.map(({ mode: optMode, labelKey, Icon }) => {
            const isSelected = mode === optMode;
            return (
              <Button
                key={optMode}
                type="button"
                variant={isSelected ? "secondary" : "outline"}
                size="sm"
                aria-pressed={isSelected}
                onClick={() => setMode(optMode)}
                className={cn(
                  "h-7 cursor-pointer items-center justify-center gap-1.5 rounded-lg border text-[11px] transition-all",
                  isSelected
                    ? "border-primary bg-primary/10 font-semibold text-primary shadow-xs"
                    : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                <span>{t(labelKey)}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* 3. Radius Adjustment */}
      <div className="border-border/40 space-y-1.5 border-t pt-1">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-[11px] font-medium">{t("theme_radius_title")}</span>
          <span className="text-muted-foreground font-mono text-[10px]">{radius}</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {RADIUS_OPTIONS.map((opt) => {
            const isRadiusActive = radius === opt.value;
            return (
              <Button
                key={opt.value}
                type="button"
                variant={isRadiusActive ? "default" : "outline"}
                size="sm"
                aria-pressed={isRadiusActive}
                onClick={() => setRadius(opt.value)}
                className={cn(
                  "h-6 cursor-pointer items-center justify-center rounded border p-0 font-mono text-[10px] transition-all",
                  isRadiusActive
                    ? "border-primary bg-primary font-semibold text-primary-foreground shadow-xs"
                    : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {opt.value}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 4. GlitchTip 异常监控诊断 */}
      <GlitchTipDiagnostic />

      {/* Footer */}
      <div className="border-border/40 text-muted-foreground flex items-center justify-between border-t pt-2 text-[10px]">
        <span>{t("theme_footer_theme", { theme: activeThemeName, mode: currentModeText })}</span>
        <span className="text-muted-foreground/80 font-mono text-[9px]">{t("theme_footer_radius", { radius })}</span>
      </div>
    </div>
  );
});

export const ThemeColorPicker = memo(function ThemeColorPicker({ className, title, ariaLabel }: ThemeColorPickerProps) {
  const t = useTranslations("shared");
  const ctxLocale = useLocale();
  const activeThemeMeta = useActiveThemeMeta();

  const [open, setOpen] = useState(false);

  const activeThemeName = ctxLocale === "en" ? (activeThemeMeta.nameEn ?? activeThemeMeta.name) : activeThemeMeta.name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground hover:bg-muted hover:text-foreground relative size-8 cursor-pointer rounded-lg",
                className,
              )}
              aria-label={ariaLabel ?? t("theme_settings_aria")}
            >
              <Palette className="size-4" />
              {/* Small colored badge dot indicating active theme */}
              <span
                className="border-background absolute right-1 bottom-1 size-2 rounded-full border shadow-xs"
                style={{ backgroundColor: activeThemeMeta.primaryColor }}
              />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {t("theme_settings_tooltip", { theme: activeThemeName })}
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="border-border/80 bg-background/95 w-80 rounded-xl p-4 shadow-xl backdrop-blur-md transition-all duration-200"
      >
        {open ? <ThemePickerPopoverContent title={title} /> : null}
      </PopoverContent>
    </Popover>
  );
});
