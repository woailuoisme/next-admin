import type { ReactNode } from "react";

import type { BaseInputProps } from "../../core";

export const DEFAULT_COLOR_PRESETS: readonly string[] = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
  "#000000",
  "#ffffff",
] as const;

export interface ColorPickerInputProps extends BaseInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (color: string) => void;
  onBlur?: () => void;
  presets?: readonly string[] | string[];
  clearable?: boolean;
  showEyeDropper?: boolean;
}

export interface ColorPickerInnerProps {
  id: string;
  value: string;
  onChange: (color: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  presets: readonly string[] | string[];
  clearable?: boolean;
  showEyeDropper?: boolean;
  computedError?: ReactNode;
}

export interface ColorTriggerProps extends Omit<
  React.ComponentPropsWithoutRef<"button">,
  "value" | "onChange"
> {
  id?: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
}

export interface ColorPaletteProps {
  presets: readonly string[] | string[];
  activeColor: string;
  onSelect: (color: string) => void;
  disabled?: boolean;
}

export interface EyeDropperButtonProps {
  onSelect: (color: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface EyeDropperOpenOptions {
  signal?: AbortSignal;
}

export interface EyeDropperOpenResult {
  sRGBHex: string;
}

export interface EyeDropperInstance {
  open(options?: EyeDropperOpenOptions): Promise<EyeDropperOpenResult>;
}

declare global {
  interface Window {
    EyeDropper?: {
      new (): EyeDropperInstance;
      prototype: EyeDropperInstance;
    };
  }
}
