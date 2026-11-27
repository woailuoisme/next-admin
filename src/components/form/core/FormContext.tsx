"use client";

import { useMemoizedFn } from "ahooks";
import { createContext, type FocusEvent, type ReactNode, type SubmitEvent, useContext, useRef } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "cn";

import { formContext as AppFormContext } from "./formContexts";
import type { AppFormContract } from "./types";

export interface FormContextValue {
	form?: AppFormContract;
}

export const FormContext = createContext<FormContextValue>({});

export function useFormContext() {
	return useContext(FormContext);
}

/**
 * Shared submit dispatcher used by `<Form>`, `<FormDialog>`, and `<ResourceFormPage>`.
 * When `isBlocked` is true (e.g. submitting, disabled, or async loading), prevents accidental Enter-key submission.
 */
export function dispatchFormSubmit(
	e: SubmitEvent<HTMLFormElement>,
	form?: AppFormContract,
	onSubmit?: (e: SubmitEvent<HTMLFormElement>) => void,
	isBlocked = false,
) {
	if (isBlocked) {
		e.preventDefault();
		e.stopPropagation();
		return;
	}
	if (onSubmit) {
		e.preventDefault();
		e.stopPropagation();
		onSubmit(e);
		return;
	}
	if (form?.handleSubmit) {
		e.preventDefault();
		e.stopPropagation();
		void form.handleSubmit();
	}
}

/**
 * 复合表单控件容器统一的失焦处理器：仅当焦点真正离开当前容器（而非在子控件间切换）时触发 onBlur。
 */
export function createContainerBlurHandler<T extends HTMLElement = HTMLElement>(onBlur?: () => void) {
	return (e: FocusEvent<T>) => {
		if (onBlur && !e.currentTarget.contains(e.relatedTarget)) {
			onBlur();
		}
	};
}

/**
 * 防止快速双击重复触发异步提交动作的互斥锁 Hook（如 FormDialog 与 ResourceFormPage 的“保存并继续”）。
 */
export function useLockedAsyncCallback(action?: () => void | Promise<void>, isBlocked = false): () => Promise<void> {
	const lockRef = useRef(false);
	// Whitelist AGENTS.md §5.2: 互斥提交回调需跨表单生命周期与异步快捷键监听保持稳定引用
	return useMemoizedFn(async () => {
		if (!action || lockRef.current || isBlocked) {
			return;
		}
		lockRef.current = true;
		try {
			await action();
		} finally {
			lockRef.current = false;
		}
	});
}

function renderWithFormProviders(form: AppFormContract | undefined, children: ReactNode) {
	return (
		<FormContext value={{ form }}>
			{form ? <AppFormContext value={form as never}>{children}</AppFormContext> : children}
		</FormContext>
	);
}

/**
 * FormDialog 与 ResourceFormPage 共用的表单主体容器：封装 aria-busy、加载横幅、提交禁用遮罩与 FormContext 注入。
 */
export function FormBodyRegion({
	formContextValue,
	loading,
	loadingLabel,
	className,
	contentClassName,
	bannerClassName,
	children,
}: {
	formContextValue: FormContextValue;
	loading: boolean;
	loadingLabel: string;
	className?: string;
	contentClassName?: string;
	bannerClassName?: string;
	children: ReactNode;
}) {
	return (
		<div className={className} aria-busy={loading || undefined}>
			{loading ? <FormLoadingBanner label={loadingLabel} className={bannerClassName} /> : null}
			<div className={cn(contentClassName, loading && "pointer-events-none opacity-60")}>
				{renderWithFormProviders(formContextValue.form, children)}
			</div>
		</div>
	);
}

/**
 * FormDialog 与 ResourceFormPage 共用的表单异步加载状态横幅。
 */
export function FormLoadingBanner({ label, className }: { label: string; className?: string }) {
	return (
		<Alert
			role="status"
			aria-live="polite"
			className={cn(
				"border-border/60 bg-muted/40 text-muted-foreground flex items-center gap-2 px-3 py-2 text-xs",
				className,
			)}
		>
			<Spinner className="text-primary size-3.5" aria-hidden="true" />
			<AlertDescription className="text-muted-foreground text-xs">{label}</AlertDescription>
		</Alert>
	);
}

export interface FormProps {
	/** TanStack Form useAppForm 实例 */
	form?: AppFormContract;
	children: ReactNode;
	className?: string;
	id?: string;
	as?: "form" | "div";
	onSubmit?: (e: SubmitEvent<HTMLFormElement>) => void;
}

export function Form({ form, children, className, id, as = "form", onSubmit }: FormProps) {
	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		dispatchFormSubmit(e, form, onSubmit);
	};

	const body =
		as === "div" ? (
			<div id={id} className={cn("flex w-full flex-col gap-5", className)}>
				{children}
			</div>
		) : (
			<form id={id} onSubmit={handleSubmit} className={cn("flex w-full flex-col gap-6", className)}>
				{children}
			</form>
		);

	return renderWithFormProviders(form, body);
}
