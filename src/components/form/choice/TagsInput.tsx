import { useMemoizedFn } from "ahooks";
import { X } from "lucide-react";
import { type KeyboardEvent, memo, useId, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { type BaseInputProps, FieldConnector, FieldWrapper } from "../core";

const EMPTY_TAGS: string[] = [];
const EMPTY_SUGGESTIONS: string[] = [];

export interface TagsInputProps extends BaseInputProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  onBlur?: () => void;
  maxTags?: number;
  suggestions?: string[];
}

interface TagsInputInnerProps {
  id: string;
  currentTags: string[];
  onChange: (tags: string[]) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  maxTags?: number;
  suggestions?: string[];
}

const TagsInputInner = memo(function TagsInputInner({
  id,
  currentTags,
  onChange,
  onBlur,
  placeholder = "输入后按 Enter 添加标签...",
  disabled,
  hasError,
  maxTags,
  suggestions = EMPTY_SUGGESTIONS,
}: TagsInputInnerProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = useMemoizedFn((rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed) return;
    if (maxTags && currentTags.length >= maxTags) return;
    if (!currentTags.includes(trimmed)) {
      onChange([...currentTags, trimmed]);
    }
    setInputValue("");
  });

  const removeTag = useMemoizedFn((indexToRemove: number) => {
    onChange(currentTags.filter((_, idx) => idx !== indexToRemove));
  });

  const handleKeyDown = useMemoizedFn((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && currentTags.length > 0) {
      removeTag(currentTags.length - 1);
    }
  });

  const unusedSuggestions = suggestions.filter((s) => !currentTags.includes(s));

  return (
    <>
      <div
        className={cn(
          "flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1 shadow-2xs transition-all focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50",
          hasError && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
          disabled && "cursor-not-allowed bg-muted/40 opacity-50",
        )}
      >
        {currentTags.map((tag, index) => (
          <Badge
            key={`${tag}-${index}`}
            variant="secondary"
            className="h-5 gap-1 rounded-md pr-1 pl-2 text-[11px] font-normal"
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="hover:text-destructive focus-visible:ring-ring inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 focus-visible:ring-1 focus-visible:outline-none"
                aria-label={`移除标签 ${tag}`}
              >
                <X className="size-2.5" />
              </button>
            )}
          </Badge>
        ))}

        {(!maxTags || currentTags.length < maxTags) && (
          <Input
            id={id}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={currentTags.length === 0 ? placeholder : ""}
            className="placeholder:text-muted-foreground h-6 min-w-[120px] flex-1 border-0 bg-transparent px-1 py-0 text-xs shadow-none focus-visible:border-0 focus-visible:ring-0 disabled:cursor-not-allowed"
          />
        )}
      </div>

      {/* 快捷推荐标签 */}
      {unusedSuggestions.length > 0 && !disabled && (
        <div className="flex flex-wrap items-center gap-1 pt-1.5">
          <span className="text-muted-foreground mr-0.5 text-[10px]">建议:</span>
          {unusedSuggestions.slice(0, 5).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => addTag(s)}
              className="border-border bg-background text-muted-foreground hover:bg-muted focus-visible:ring-ring inline-flex cursor-pointer items-center rounded border px-1.5 py-0.5 text-[10px] font-normal transition-colors focus-visible:ring-1 focus-visible:outline-none"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </>
  );
});

export const TagsInput = memo(function TagsInput({
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
  placeholder = "输入后按 Enter 添加标签...",
  disabled,
  value: controlledValue,
  defaultValue = EMPTY_TAGS,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  maxTags,
  suggestions = EMPTY_SUGGESTIONS,
}: TagsInputProps) {
  const autoId = useId();
  const id = explicitId || (name ? `field-${name}` : autoId);

  return (
    <FieldConnector<string[]>
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      error={error}
    >
      {({ value = EMPTY_TAGS, onChange, onBlur, error: computedError }) => {
        const currentTags = Array.isArray(value) ? value : EMPTY_TAGS;

        return (
          <FieldWrapper
            label={label}
            id={id}
            required={required}
            hint={hint}
            helperText={helperText}
            tooltip={tooltip}
            error={computedError}
            colSpan={colSpan}
            className={className}
            hidden={hidden}
          >
            <TagsInputInner
              id={id}
              currentTags={currentTags}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              hasError={Boolean(computedError)}
              maxTags={maxTags}
              suggestions={suggestions}
            />
          </FieldWrapper>
        );
      }}
    </FieldConnector>
  );
});
