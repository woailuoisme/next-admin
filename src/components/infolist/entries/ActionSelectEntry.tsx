"use client";

import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "cn";

export interface ActionSelectOption<TValue extends string = string> {
  label: string;
  value: TValue;
}

export interface ActionSelectEntryProps<TValue extends string = string> {
  label: React.ReactNode;
  icon?: LucideIcon;
  value: TValue;
  options: readonly ActionSelectOption<TValue>[];
  onChange: (nextValue: TValue) => void | Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  isPending?: boolean;
  pendingText?: React.ReactNode;
  className?: string;
}

/**
 * Filament 风格详情内联动作选择器：
 * 用于在 Infolist 抽屉/详情页中直接切换状态并触发变更（配合 `useResourceAction`）。
 */
export const ActionSelectEntry = React.memo(function ActionSelectEntry<TValue extends string = string>({
  label,
  icon: Icon,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
  isPending = false,
  pendingText,
  className,
}: ActionSelectEntryProps<TValue>) {
  const triggerId = React.useId();

  return (
    <div className={cn("border-border/70 bg-muted/20 space-y-2 rounded-xl border p-3", className)}>
      <Label htmlFor={triggerId} className="flex items-center gap-1.5 text-xs font-semibold">
        {Icon ? <Icon className="text-primary size-3.5" aria-hidden="true" /> : null}
        {label}
      </Label>
      <Select value={value} onValueChange={(val) => void onChange(val as TValue)} disabled={disabled || isPending}>
        <SelectTrigger id={triggerId} className="h-8 w-full text-xs font-medium capitalize">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && pendingText ? (
        <p className="text-muted-foreground flex items-center gap-1 text-[10px]">
          <Loader2 className="size-3 animate-spin" /> {pendingText}
        </p>
      ) : null}
    </div>
  );
}) as <TValue extends string = string>(props: ActionSelectEntryProps<TValue>) => React.ReactElement;
