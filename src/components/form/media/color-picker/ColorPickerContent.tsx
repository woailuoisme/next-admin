"use client";

import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { Palette, Pipette } from "lucide-react";
import { type ChangeEvent, type KeyboardEvent, memo, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

import { getNextPaletteIndex, isValidHexColor, normalizeHexInput, toSixDigitHex } from "./colorUtils";
import type { EyeDropperInstance } from "./types";

function checkEyeDropperSupport(): boolean {
  return typeof window !== "undefined" && "EyeDropper" in window;
}

const emptySubscribe = () => () => {};

export interface ColorPickerContentProps {
  value: string;
  onChange: (color: string) => void;
  onBlur?: () => void;
  presets: readonly string[] | string[];
  disabled?: boolean;
  showEyeDropper?: boolean;
}

export const ColorPickerContent = memo(function ColorPickerContent({
  value,
  onChange,
  onBlur,
  presets,
  disabled,
  showEyeDropper = true,
}: ColorPickerContentProps) {
  const t = useTranslations("form");
  // draft is only non-null when the user is actively typing an in-progress hex code
  const [draft, setDraft] = useState<string | null>(null);
  const [hexError, setHexError] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState(value);
  const [focusedPresetIndex, setFocusedPresetIndex] = useState<number | null>(null);
  const paletteRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isEyeDropperSupported = useSyncExternalStore(emptySubscribe, checkEyeDropperSupport, () => false);

  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(null);
    setHexError(null);
    setFocusedPresetIndex(null);
  }

  const currentText = draft ?? value;

  const handleNativeChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    setDraft(null);
    setHexError(null);
    onChange(e.target.value);
  });

  const handleTextInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    const val = normalizeHexInput(e.target.value);
    setDraft(val);
    if (val === "" || val === "#") {
      setHexError(null);
      return;
    }
    if (isValidHexColor(val)) {
      setHexError(null);
      onChange(val);
    } else {
      setHexError(t("color_invalid_hex"));
    }
  });

  const handleBlur = useMemoizedFn(() => {
    if (draft !== null) {
      if (isValidHexColor(draft)) {
        setHexError(null);
        onChange(draft);
        setDraft(null);
      } else if (draft === "" || draft === "#") {
        setHexError(null);
        onChange("");
        setDraft(null);
      } else {
        setHexError(t("color_invalid_hex"));
      }
    }
    onBlur?.();
  });

  const handleKeyDown = useMemoizedFn((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (draft !== null && isValidHexColor(draft)) {
        setHexError(null);
        onChange(draft);
        setDraft(null);
      } else if (draft !== null && draft !== "" && draft !== "#") {
        setHexError(t("color_invalid_hex"));
      }
    }
  });

  const handleSelectPreset = useMemoizedFn((color: string) => {
    setDraft(null);
    setHexError(null);
    onChange(color);
  });

  const handlePaletteKeyDown = useMemoizedFn((index: number, e: KeyboardEvent<HTMLButtonElement>) => {
    const nextIdx = getNextPaletteIndex(index, e.key, presets.length, 6);
    if (nextIdx !== index && nextIdx >= 0 && nextIdx < presets.length) {
      e.preventDefault();
      setFocusedPresetIndex(nextIdx);
      paletteRefs.current[nextIdx]?.focus();
    }
  });

  const handlePickEyeDropper = useMemoizedFn(async () => {
    if (!checkEyeDropperSupport() || disabled || !window.EyeDropper) return;
    try {
      let eyeDropper: EyeDropperInstance | undefined;
      try {
        eyeDropper = new window.EyeDropper();
      } catch {
        const EyeDropperFn = window.EyeDropper as unknown as () => EyeDropperInstance;
        if (typeof EyeDropperFn === "function") {
          eyeDropper = EyeDropperFn();
        }
      }
      if (!eyeDropper || typeof eyeDropper.open !== "function") return;
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        handleSelectPreset(result.sRGBHex);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }
  });

  const fallbackColor = toSixDigitHex(currentText);
  const normalizedActive = value.toLowerCase();
  const selectedPresetIndex = presets.findIndex((color) => normalizedActive === color.toLowerCase());
  const tabStopPresetIndex =
    focusedPresetIndex !== null && focusedPresetIndex < presets.length
      ? focusedPresetIndex
      : selectedPresetIndex >= 0
        ? selectedPresetIndex
        : 0;

  return (
    <div className="w-56 space-y-3 p-3">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="border-border relative size-8 shrink-0 overflow-hidden rounded-md border shadow-2xs">
            <input
              type="color"
              value={fallbackColor}
              onChange={handleNativeChange}
              disabled={disabled}
              aria-label={t("color_native_picker_label")}
              className="absolute -top-2 -left-2 size-12 cursor-pointer opacity-0 disabled:cursor-not-allowed"
            />
            <span className="block size-full" style={{ backgroundColor: fallbackColor }} aria-hidden="true" />
          </div>

          <Input
            value={currentText}
            onChange={handleTextInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="#000000"
            maxLength={9}
            aria-invalid={Boolean(hexError) || undefined}
            className="h-8 font-mono text-xs uppercase"
            aria-label={t("color_hex_input_label")}
          />

          {showEyeDropper && isEyeDropperSupported && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled}
              onClick={handlePickEyeDropper}
              title={t("color_eyedropper")}
              aria-label={t("color_eyedropper")}
              className="text-muted-foreground hover:text-foreground size-8 shrink-0"
            >
              <Pipette className="size-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>

        {hexError && (
          <p role="alert" className="text-destructive text-[11px]">
            {hexError}
          </p>
        )}
      </div>

      {presets && presets.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
            <Palette className="size-3" aria-hidden="true" />
            <span>{t("color_presets_title")}</span>
          </div>
          <div className="grid grid-cols-6 gap-1.5" role="listbox" aria-label={t("color_presets_aria")}>
            {presets.map((color, index) => {
              const isSelected = normalizedActive === color.toLowerCase();
              const isTabStop = !disabled && index === tabStopPresetIndex;
              return (
                <Button
                  key={`${color}-${index}`}
                  ref={(el) => {
                    paletteRefs.current[index] = el;
                  }}
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  role="option"
                  tabIndex={isTabStop ? 0 : -1}
                  aria-selected={isSelected}
                  aria-label={t("color_select_preset", { color })}
                  disabled={disabled}
                  onFocus={() => setFocusedPresetIndex(index)}
                  onClick={() => handleSelectPreset(color)}
                  onKeyDown={(e) => handlePaletteKeyDown(index, e)}
                  className={cn(
                    "size-6 cursor-pointer rounded-md border border-border/70 p-0 shadow-2xs transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                    isSelected && "ring-2 ring-primary ring-offset-1",
                  )}
                  style={{ backgroundColor: color }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
