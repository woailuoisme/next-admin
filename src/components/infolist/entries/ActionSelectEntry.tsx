"use client";

import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { COL_SPAN_CLASSES, type ColSpan } from "@/components/shared/grid";
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
	hidden?: boolean;
	colSpan?: ColSpan;
	className?: string;
}

/**
 * Filament 风格详情内联动作选择器：
 * 用于在 Infolist 抽屉/详情页中直接切换状态并触发变更（配合 `useResourceAction`）。
 */
function ActionSelectEntryImpl<TValue extends string = string>({
	label,
	icon: Icon,
	value,
	options,
	onChange,
	placeholder,
	disabled = false,
	isPending = false,
	pendingText,
	hidden = false,
	colSpan,
	className,
}: ActionSelectEntryProps<TValue>) {
	const triggerId = React.useId();
	const [localPending, setLocalPending] = React.useState(false);
	const pendingLockRef = React.useRef(false);

	if (hidden) return null;

	const busy = isPending || localPending;

	const handleValueChange = async (nextVal: string) => {
		if (nextVal === value || disabled || pendingLockRef.current) return;
		pendingLockRef.current = true;
		setLocalPending(true);
		try {
			await Promise.resolve(onChange(nextVal as TValue));
		} catch {
			// 调用方 mutation/toast 负责错误反馈，此处兜底避免未捕获 Promise Rejection
		} finally {
			pendingLockRef.current = false;
			setLocalPending(false);
		}
	};

	return (
		<div
			className={cn(
				"border-border/70 bg-muted/20 space-y-2 rounded-xl border p-3",
				colSpan ? COL_SPAN_CLASSES[colSpan] : undefined,
				className,
			)}
		>
			<Label htmlFor={triggerId} className="flex items-center gap-1.5 text-xs font-semibold">
				{Icon ? <Icon className="text-primary size-3.5" aria-hidden="true" /> : null}
				{label}
			</Label>
			<Select value={value} onValueChange={(val) => void handleValueChange(val)} disabled={disabled || busy}>
				<SelectTrigger
					id={triggerId}
					aria-busy={busy || undefined}
					className="h-8 w-full text-xs font-medium capitalize"
				>
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
			{busy && pendingText ? (
				<p role="status" aria-live="polite" className="text-muted-foreground flex items-center gap-1 text-[10px]">
					<Loader2 className="size-3 animate-spin" aria-hidden="true" /> {pendingText}
				</p>
			) : null}
		</div>
	);
}

export const ActionSelectEntry = ActionSelectEntryImpl as <TValue extends string = string>(
	props: ActionSelectEntryProps<TValue>,
) => React.ReactElement;
