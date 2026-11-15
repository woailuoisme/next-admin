import { useMemoizedFn } from "ahooks";
import { isNil } from "es-toolkit";
import { memo, useState } from "react";
import { toast } from "sonner";

import type { TextInputCellProps } from "./types";

import { InlineEditDisplay } from "./InlineEditDisplay";
import { InlineEditInput } from "./InlineEditInput";

function TextInputCellInner<TData = unknown>({
  value,
  row,
  onCellChange,
  type = "text",
  inputMode,
  placeholder = "点击编辑...",
  prefix,
  suffix,
  schema,
  rules,
  showErrorToast = true,
  errorToastMessage,
  disabled = false,
  align = "left",
  className,
}: TextInputCellProps<TData>) {
  const externalVal = !isNil(value) ? String(value) : "";
  const [isEditing, setIsEditing] = useState(false);
  const [currentVal, setCurrentVal] = useState(externalVal);
  const [savedOverride, setSavedOverride] = useState<{ baseValue: unknown; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();

  const savedVal = savedOverride && Object.is(savedOverride.baseValue, value) ? savedOverride.text : externalVal;

  const validateValue = useMemoizedFn((val: string): string | undefined => {
    if (schema) {
      const parsedInput = type === "number" ? (val === "" ? null : Number(val)) : val;
      const res = schema.safeParse(parsedInput);
      if (!res.success) {
        const firstIssue = res.error.issues[0];
        return firstIssue?.message || "输入格式不正确";
      }
    }
    if (rules) {
      const ruleResult = rules(val, row);
      if (typeof ruleResult === "string" && ruleResult.length > 0) {
        return ruleResult;
      }
    }
    return undefined;
  });

  const handleChange = useMemoizedFn((nextVal: string) => {
    setCurrentVal(nextVal);
    if (errorMsg) {
      const err = validateValue(nextVal);
      setErrorMsg(err);
    }
  });

  const commitChange = useMemoizedFn(async () => {
    if (disabled || loading) return;
    if (currentVal === savedVal) {
      setErrorMsg(undefined);
      setIsEditing(false);
      return;
    }

    const validationErr = validateValue(currentVal);
    if (validationErr) {
      setErrorMsg(validationErr);
      return;
    }

    setErrorMsg(undefined);
    setIsEditing(false);
    const previous = savedVal;
    setSavedOverride({ baseValue: value, text: currentVal });

    if (onCellChange) {
      try {
        setLoading(true);
        const result = onCellChange(row, currentVal);
        if (result instanceof Promise) {
          await result;
        }
      } catch (err) {
        // Rollback on error
        setSavedOverride({ baseValue: value, text: previous });
        setCurrentVal(previous);
        if (showErrorToast) {
          const msg =
            typeof errorToastMessage === "function"
              ? errorToastMessage(err)
              : errorToastMessage || "保存失败，已自动回滚";
          toast.error(msg);
        }
      } finally {
        setLoading(false);
      }
    }
  });

  const cancelChange = useMemoizedFn(() => {
    setErrorMsg(undefined);
    setCurrentVal(savedVal);
    setIsEditing(false);
  });

  const handleStartEdit = useMemoizedFn(() => {
    setCurrentVal(savedVal);
    setErrorMsg(undefined);
    setIsEditing(true);
  });

  if (isEditing && !disabled) {
    return (
      <InlineEditInput
        value={currentVal}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        prefix={prefix}
        suffix={suffix}
        error={errorMsg}
        onChange={handleChange}
        onCommit={commitChange}
        onCancel={cancelChange}
        className={className}
      />
    );
  }

  return (
    <InlineEditDisplay
      value={savedVal}
      placeholder={placeholder}
      disabled={disabled}
      loading={loading}
      align={align}
      className={className}
      onStartEdit={handleStartEdit}
    />
  );
}

export const TextInputCell = memo(TextInputCellInner) as typeof TextInputCellInner;
