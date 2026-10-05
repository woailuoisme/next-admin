import { useMemoizedFn } from "ahooks";
import { type ChangeEvent, type KeyboardEvent, memo, useState } from "react";

import { Input } from "@/components/ui/input";

import { ColorPalette } from "./ColorPalette";
import { EyeDropperButton } from "./EyeDropperButton";

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
  const [draft, setDraft] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value);
  }

  const handleNativeChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setDraft(next);
    onChange(next);
  });

  const handleTextInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (val && !val.startsWith("#")) {
      val = `#${val}`;
    }
    setDraft(val);
    // 校验完整的 3位 / 6位 / 8位 HEX，符合规则时即时提交
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(val)) {
      onChange(val);
    }
  });

  const handleBlur = useMemoizedFn(() => {
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(draft)) {
      onChange(draft);
    } else if (draft === "" || draft === "#") {
      onChange("");
    } else {
      // 非法输入失焦时恢复为上一有效值
      setDraft(value);
    }
    onBlur?.();
  });

  const handleKeyDown = useMemoizedFn((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(draft)) {
        onChange(draft);
      }
    }
  });

  const handleSelectPreset = useMemoizedFn((color: string) => {
    setDraft(color);
    onChange(color);
  });

  const fallbackColor = (() => {
    const trimmed = (draft || value).trim();
    if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
      return trimmed.toLowerCase();
    }
    if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
      const r = trimmed[1];
      const g = trimmed[2];
      const b = trimmed[3];
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return "#000000";
  })();

  return (
    <div className="w-56 space-y-3 p-3">
      <div className="flex items-center gap-2">
        {/* Native Color Input with Visual Badge */}
        <div className="border-border relative size-8 shrink-0 overflow-hidden rounded-md border shadow-2xs">
          <input
            type="color"
            value={fallbackColor}
            onChange={handleNativeChange}
            disabled={disabled}
            aria-label="选择颜色色盘"
            className="absolute -top-2 -left-2 size-12 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
          <span
            className="block size-full"
            style={{ backgroundColor: fallbackColor }}
            aria-hidden="true"
          />
        </div>

        {/* Text Input for HEX code */}
        <Input
          value={draft}
          onChange={handleTextInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="#000000"
          maxLength={9}
          className="h-8 font-mono text-xs uppercase"
          aria-label="十六进制颜色代码"
        />

        {/* Browser Native EyeDropper */}
        {showEyeDropper && <EyeDropperButton onSelect={handleSelectPreset} disabled={disabled} />}
      </div>

      {/* Presets Grid */}
      <ColorPalette
        presets={presets}
        activeColor={value}
        onSelect={handleSelectPreset}
        disabled={disabled}
      />
    </div>
  );
});
