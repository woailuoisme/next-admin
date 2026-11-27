"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type KeyboardEvent, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

import { type BaseInputProps, connectField, createContainerBlurHandler, type FormFieldRenderProps } from "../core";

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

type TagsExtraProps = Pick<TagsInputProps, "placeholder" | "maxTags" | "suggestions">;

function TagsInputControl({
	id,
	value,
	onChange,
	onBlur,
	placeholder,
	disabled,
	readOnly,
	required,
	hasError,
	describedBy,
	maxTags,
	suggestions = EMPTY_SUGGESTIONS,
}: FormFieldRenderProps<string[]> & TagsExtraProps) {
	const currentTags = Array.isArray(value) ? value : EMPTY_TAGS;
	const t = useTranslations("form");
	const inputRef = useRef<HTMLInputElement>(null);
	const resolvedPlaceholder = placeholder ?? t("tags_placeholder");
	const [inputValue, setInputValue] = useState("");
	const isLocked = Boolean(disabled || readOnly);
	const isMaxReached = maxTags !== undefined && currentTags.length >= maxTags;

	const addTag = (rawText: string) => {
		if (isLocked || isMaxReached) return;
		const trimmed = rawText.trim();
		if (!trimmed) return;
		if (!currentTags.includes(trimmed)) {
			onChange([...currentTags, trimmed]);
		}
		setInputValue("");
	};

	const removeTag = (indexToRemove: number) => {
		if (isLocked) return;
		onChange(currentTags.filter((_, idx) => idx !== indexToRemove));
		inputRef.current?.focus();
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (isLocked || e.nativeEvent.isComposing) return;
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addTag(inputValue);
		} else if (e.key === "Backspace" && !inputValue && currentTags.length > 0) {
			removeTag(currentTags.length - 1);
		}
	};

	const unusedSuggestions = suggestions.filter((s) => !currentTags.includes(s));

	return (
		<div onBlur={createContainerBlurHandler(onBlur)} className="flex w-full flex-col gap-1.5">
			<div
				className={cn(
					"border-input focus-within:border-ring focus-within:ring-ring/50 flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-lg border bg-transparent px-2 py-1 shadow-2xs transition-all focus-within:ring-2",
					hasError && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
					disabled && "bg-muted/40 cursor-not-allowed opacity-50",
				)}
			>
				{currentTags.map((tag, index) => (
					<Badge
						key={`${tag}-${index}`}
						variant="secondary"
						className="h-5 gap-1 overflow-visible rounded-md pr-1 pl-2 text-xs font-normal"
					>
						<span>{tag}</span>
						{!isLocked ? (
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								onClick={(e) => {
									e.stopPropagation();
									removeTag(index);
								}}
								className="hover:text-destructive relative size-3.5 cursor-pointer rounded-full p-0 after:absolute after:-inset-1 after:content-['']"
								aria-label={t("tags_remove", { tag })}
							>
								<X className="size-2.5" aria-hidden="true" />
							</Button>
						) : null}
					</Badge>
				))}

				<Input
					ref={inputRef}
					id={id}
					type="text"
					value={isMaxReached ? "" : inputValue}
					onChange={(e) => {
						if (!isLocked && !isMaxReached) {
							setInputValue(e.target.value);
						}
					}}
					onKeyDown={handleKeyDown}
					disabled={disabled}
					readOnly={readOnly || isMaxReached}

					aria-invalid={hasError}
					aria-required={required}
					aria-describedby={describedBy}
					placeholder={currentTags.length === 0 ? resolvedPlaceholder : ""}
					className={cn(
						"placeholder:text-muted-foreground h-6 min-w-28 flex-1 border-0 bg-transparent px-1 py-0 text-xs shadow-none focus-visible:border-0 focus-visible:ring-0 disabled:cursor-not-allowed",
						isMaxReached && "w-6 min-w-6 caret-transparent",
					)}
				/>
			</div>

			{unusedSuggestions.length > 0 && !isLocked && !isMaxReached ? (
				<div className="flex flex-wrap items-center gap-1">
					<span className="text-muted-foreground mr-0.5 text-xs">{t("tags_suggestions")}</span>
					{unusedSuggestions.slice(0, 5).map((s) => (
						<Button
							type="button"
							variant="outline"
							size="xs"
							key={s}
							onClick={() => addTag(s)}
							className="h-5 cursor-pointer px-1.5 py-0 text-xs font-normal"
						>
							+ {s}
						</Button>
					))}
				</div>
			) : null}
		</div>
	);
}

export const TagsInput = connectField<string[], TagsExtraProps>(TagsInputControl);
