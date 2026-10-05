import { useMemoizedFn } from "ahooks";
import { type ChangeEvent, type FocusEvent, memo, useId, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { type BaseInputProps, FieldConnector, FieldWrapper, resolveFieldHasError } from "../core";

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
  const [displayValue, setDisplayValue] = useState(() => formatAmount(value, decimals));
  const [prevValue, setPrevValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  if (value !== prevValue) {
    setPrevValue(value);
    if (!isFocused) {
      setDisplayValue(formatAmount(value, decimals));
    }
  }

  const handleInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    if (!allowNegative) {
      raw = raw.replaceAll("-", "");
    }
    // Strip characters except digits, dot and minus
    const clean = raw.replaceAll(/[^0-9.-]/g, "");
    setDisplayValue(clean);

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
    // In focus, display without thousand separators for easy editing
    if (value != null && !Number.isNaN(value)) {
      setDisplayValue(value.toString());
    }
  });

  const handleBlur = useMemoizedFn((e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const parsed = parseAmount(e.target.value);
    setDisplayValue(formatAmount(parsed, decimals));
    onBlur?.();
  });

  const hasCurrenciesSelect = Boolean(currencies && currencies.length > 1);

  return (
    <InputGroup
      className={cn(
        "w-full rounded-md",
        hasError && "border-destructive ring-destructive/20",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      {hasCurrenciesSelect ? (
        <InputGroupAddon align="inline-start" className="border-r p-0">
          <Select value={currency} onValueChange={onCurrencyChange} disabled={disabled || readOnly}>
            <SelectTrigger className="h-8 border-none bg-transparent px-2 text-xs font-semibold shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies!.map((curr) => (
                <SelectItem key={curr} value={curr} className="text-xs">
                  {curr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InputGroupAddon>
      ) : (
        <InputGroupAddon align="inline-start">
          <InputGroupText className="text-muted-foreground text-xs font-semibold">
            {currencySymbol}
          </InputGroupText>
        </InputGroupAddon>
      )}

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
        className={cn("text-right tabular-nums", inputClassName)}
      />

      {!hasCurrenciesSelect && currency && (
        <InputGroupAddon align="inline-end">
          <InputGroupText className="text-muted-foreground text-[11px] font-medium uppercase">
            {currency}
          </InputGroupText>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
});

export function CurrencyInput({
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
  defaultValue,
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
  const generatedId = useId();
  const id = explicitId || generatedId;

  return (
    <FieldConnector
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      disabled={disabled}
      readOnly={readOnly}
      render={({ value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, meta }) => {
        const hasError = resolveFieldHasError(error, meta);
        const numValue = typeof value === "number" ? value : null;

        return (
          <FieldWrapper
            id={id}
            label={label}
            required={required}
            hint={hint}
            helperText={helperText}
            tooltip={tooltip}
            error={error}
            meta={meta}
            colSpan={colSpan}
            className={className}
            hidden={hidden}
          >
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
          </FieldWrapper>
        );
      }}
    />
  );
}
