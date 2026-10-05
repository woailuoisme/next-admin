import type React from "react";

import { Check, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InlineEditInputProps {
  value: string;
  type?: "text" | "number" | "email" | "password" | "url";
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: string;
  onChange: (nextValue: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  className?: string;
}

export function InlineEditInput({
  value,
  type = "text",
  inputMode,
  placeholder,
  prefix,
  suffix,
  error,
  onChange,
  onCommit,
  onCancel,
  className,
}: InlineEditInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onCommit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      className={cn("relative flex min-w-[120px] items-center gap-1", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {prefix && (
        <span className="text-muted-foreground flex shrink-0 items-center text-xs">{prefix}</span>
      )}
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onCommit}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-7 px-2 py-0 text-xs",
            error &&
              "border-destructive text-destructive focus-visible:border-destructive focus-visible:ring-destructive",
          )}
          placeholder={placeholder}
          aria-label={placeholder || "Edit value"}
          aria-invalid={Boolean(error)}
        />
        {error && (
          <div
            role="alert"
            className="animate-in border-destructive/20 bg-destructive text-destructive-foreground fade-in-0 zoom-in-95 pointer-events-none absolute top-full left-0 z-50 mt-1 rounded border px-1.5 py-0.5 text-[10px] whitespace-nowrap shadow-md"
          >
            {error}
          </div>
        )}
      </div>
      {suffix && (
        <span className="text-muted-foreground flex shrink-0 items-center text-xs">{suffix}</span>
      )}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onCommit();
        }}
        className={cn(
          "cursor-pointer p-1 transition-colors",
          error
            ? "cursor-not-allowed text-muted-foreground/40"
            : "text-primary hover:text-primary/80",
        )}
        disabled={Boolean(error)}
        title="确认 (Enter)"
        aria-label="确认修改"
      >
        <Check className="size-3" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onCancel();
        }}
        className="text-muted-foreground hover:text-foreground cursor-pointer p-1 transition-colors"
        title="取消 (Esc)"
        aria-label="取消修改"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
