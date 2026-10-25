import { useMemoizedFn } from "ahooks";
import { type ChangeEvent, memo, useState } from "react";

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "cn";

import { type BaseInputProps, FormFieldEngine } from "../core";

export interface CurrencyInputProps extends BaseInputProps {
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  onBlur?: () => void;
  currency?: string;
  currencies?: string[];
  onCurrencyChange?: (currency: string) => void;
  currencySymbol?: string;
  decimals?: number;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  inputClassName?: string;
}

interface CurrencyInputInnerProps {
  id: string;
  value?: number | null;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  currency?: string;
  currencies?: string[];
  onCurrencyChange?: (currency: string) => void;
  currencySymbol?: string;
  decimals?: number;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  inputClassName?: string;
  hasError?: boolean;
}

function formatAmount(val: number | null | undefined, decimals = 2): string {
  if (val == null || Number.isNaN(val)) return "";
  return val.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function parseAmount(raw: string): number | null {
  const sanitized = raw.replaceAll(",", "").trim();
  if (sanitized === "" || sanitized === "-") return null;
  const num = Number(sanitized);
  return Number.isNaN(num) ? null : num;
}

const CurrencyInputInner = memo(function CurrencyInputInner({
  id,
  value,
  onChange,
  onBlur,
  currency = "USD",
  currencies,
  onCurrencyChange,
  currencySymbol = "$",
  decimals = 2,
  min,
  max,
  allowNegative = false,
  placeholder = "0.00",
  disabled,
  readOnly,
  inputClassName,
  hasError,
}: CurrencyInputInnerProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [editingValue, setEditingValue] = useState<string | null>(null);

  const displayValue = isFocused
    ? (editingValue ?? (value == null ? "" : String(value)))
    : formatAmount(value, decimals);

  const handleInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    if (!allowNegative) {
      raw = raw.replaceAll("-", "");
    }
    // Strip characters except digits, dot and minus
    const clean = raw.replaceAll(/[^0-9.-]/g, "");
    setEditingValue(clean);

    const parsed = parseAmount(clean);
    if (parsed == null) {
      onChange(null);
      return;
    }

    if (min != null && parsed < min) {
      onChange(min);
      return;
    }
    if (max != null && parsed > max) {
      onChange(max);
      return;
    }

    onChange(parsed);
  });

  const handleFocus = useMemoizedFn(() => {
    setIsFocused(true);
    setEditingValue(value == null ? "" : String(value));
  });

  const handleBlur = useMemoizedFn(() => {
    setIsFocused(false);
    setEditingValue(null);

    // Format and clamp on blur
    if (value != null) {
      if (min != null && value < min) {
        onChange(min);
      } else if (max != null && value > max) {
        onChange(max);
      }
    }
    onBlur?.();
  });

  const hasMultiCurrency = Boolean(currencies && currencies.length > 1);

  return (
    <InputGroup
      className={cn(
        "w-full rounded-md",
        hasError && "border-destructive ring-destructive/20",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      {/* Currency Symbol or Selector Addon */}
      {hasMultiCurrency ? (
        <InputGroupAddon align="inline-start" className="p-0">
          <Select value={currency} onValueChange={onCurrencyChange} disabled={disabled || readOnly}>
            <SelectTrigger className="h-full rounded-r-none border-0 bg-transparent px-2.5 font-mono text-xs font-semibold shadow-none focus:ring-0">
              <SelectValue>{currency}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {currencies!.map((curr) => (
                <SelectItem key={curr} value={curr} className="font-mono text-xs font-medium">
                  {curr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InputGroupAddon>
      ) : (
        <InputGroupAddon align="inline-start">
          <InputGroupText className="font-mono text-xs font-semibold select-none">
            {currencySymbol || currency}
          </InputGroupText>
        </InputGroupAddon>
      )}

      {/* Amount Input Field */}
      <InputGroupInput
        id={id}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={hasError}
        className={cn("font-mono text-xs", inputClassName)}
      />

      {/* ISO Currency code suffix when single currency */}
      {!hasMultiCurrency && currency && (
        <InputGroupAddon align="inline-end">
          <InputGroupText className="text-muted-foreground font-mono text-[11px] font-medium select-none">
            {currency}
          </InputGroupText>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
});

export const CurrencyInput = memo(function CurrencyInput({
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
  placeholder,
  disabled,
  readOnly,
  value: controlledValue,
  defaultValue = null,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  currency = "USD",
  currencies,
  onCurrencyChange,
  currencySymbol = "$",
  decimals = 2,
  min,
  max,
  allowNegative = false,
  inputClassName,
}: CurrencyInputProps) {
  return (
    <FormFieldEngine<number | null>
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
      readOnly={readOnly}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
    >
      {({ id, value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError }) => {
        const numValue = typeof value === "number" ? value : null;

        return (
          <CurrencyInputInner
            id={id}
            value={numValue}
            onChange={onChange}
            onBlur={onBlur}
            currency={currency}
            currencies={currencies}
            onCurrencyChange={onCurrencyChange}
            currencySymbol={currencySymbol}
            decimals={decimals}
            min={min}
            max={max}
            allowNegative={allowNegative}
            placeholder={placeholder}
            disabled={isDisabled}
            readOnly={isReadOnly}
            inputClassName={inputClassName}
            hasError={hasError}
          />
        );
      }}
    </FormFieldEngine>
  );
});
