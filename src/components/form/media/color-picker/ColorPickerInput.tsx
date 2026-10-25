import { useMemoizedFn } from "ahooks";
import { X } from "lucide-react";
import { memo, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { FormFieldEngine } from "../../core";
import { ColorPickerContent } from "./ColorPickerContent";
import { ColorTrigger } from "./ColorTrigger";
import { type ColorPickerInnerProps, type ColorPickerInputProps, DEFAULT_COLOR_PRESETS } from "./types";

interface ColorPickerControlProps extends Omit<ColorPickerInnerProps, "computedError"> {
  hasError?: boolean;
}

const ColorPickerControl = memo(function ColorPickerControl({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  placeholder,
  presets,
  clearable = true,
  showEyeDropper = true,
  hasError,
}: ColorPickerControlProps) {
  const [open, setOpen] = useState(false);

  const handleClear = useMemoizedFn((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    onBlur?.();
  });

  const hasValue = Boolean(value);

  return (
    <div className="relative flex w-full items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <ColorTrigger id={id} value={value} placeholder={placeholder} disabled={disabled} hasError={hasError} />
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <ColorPickerContent
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            presets={presets}
            disabled={disabled}
            showEyeDropper={showEyeDropper}
          />
        </PopoverContent>
      </Popover>

      {clearable && hasValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="text-muted-foreground/70 hover:bg-muted hover:text-destructive focus-visible:ring-ring absolute right-2 cursor-pointer rounded p-0.5 transition-colors focus-visible:ring-1 focus-visible:outline-none"
          aria-label="清除颜色"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
});

export const ColorPickerInput = memo(function ColorPickerInput({
  name,
  form,
  label,
  id: explicitId,
  required,
  hint,
  helperText,
  tooltip,
  error,
  colSpan,
  className,
  hidden,
  placeholder = "#000000",
  disabled,
  value: controlledValue,
  defaultValue = "",
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  presets = DEFAULT_COLOR_PRESETS,
  clearable = true,
  showEyeDropper = true,
}: ColorPickerInputProps) {
  return (
    <FormFieldEngine<string>
      name={name}
      form={form}
      label={label}
      id={explicitId}
      required={required}
      hint={hint}
      helperText={helperText}
      tooltip={tooltip}
      error={error}
      colSpan={colSpan}
      className={className}
      hidden={hidden}
      disabled={disabled}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
    >
      {({ id, value = "", onChange, onBlur, disabled: isDisabled, hasError }) => (
        <ColorPickerControl
          id={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={isDisabled}
          placeholder={placeholder}
          presets={presets}
          clearable={clearable}
          showEyeDropper={showEyeDropper}
          hasError={hasError}
        />
      )}
    </FormFieldEngine>
  );
});
