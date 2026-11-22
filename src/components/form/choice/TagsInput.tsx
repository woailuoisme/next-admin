"use client";

import { useMemoizedFn } from "ahooks";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type KeyboardEvent, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

import { type BaseInputProps, connectField } from "../core";

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

interface TagsInputControlProps {
	id: string;
	value?: string[];
	onChange: (tags: string[]) => void;
	onBlur?: () => void;
	placeholder?: string;
	disabled?: boolean;
	readOnly?: boolean;
	hasError?: boolean;
	describedBy?: string;
	maxTags?: number;
	suggestions?: string[];
}

function TagsInputControl({
	id,
	value,
	onChange,
	onBlur,
	placeholder,
	disabled,
	readOnly,
	hasError,
	describedBy,
	maxTags,
	suggestions = EMPTY_SUGGESTIONS,
}: TagsInputControlProps) {
	const currentTags = Array.isArray(value) ? value : EMPTY_TAGS;
	const t = useTranslations("form");
	const resolvedPlaceholder = placeholder ?? t("tags_placeholder");
	const [inputValue, setInputValue] = useState("");
	const isLocked = Boolean(disabled || readOnly);

	const addTag = useMemoizedFn((rawText: string) => {
		if (isLocked) return;
		const trimmed = rawText.trim();
		if (!trimmed) return;
		if (maxTags && currentTags.length >= maxTags) return;
		if (!currentTags.includes(trimmed)) {
			onChange([...currentTags, trimmed]);
		}
		setInputValue("");
	});

	const removeTag = useMemoizedFn((indexToRemove: number) => {
		if (isLocked) return;
		onChange(currentTags.filter((_, idx) => idx !== indexToRemove));
	});

	const handleKeyDown = useMemoizedFn((e: KeyboardEvent<HTMLInputElement>) => {
		if (isLocked) return;
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
						{!isLocked && (
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								onClick={(e) => {
									e.stopPropagation();
									removeTag(index);
								}}
								className="hover:text-destructive relative size-3.5 cursor-pointer rounded-full p-0 after:absolute after:-inset-1.5 after:content-['']"
								aria-label={t("tags_remove", { tag })}
							>
								<X className="size-2.5" aria-hidden="true" />
							</Button>
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
						readOnly={readOnly}
						aria-invalid={hasError}
						aria-describedby={describedBy}
						placeholder={currentTags.length === 0 ? resolvedPlaceholder : ""}
						className="placeholder:text-muted-foreground h-6 min-w-[120px] flex-1 border-0 bg-transparent px-1 py-0 text-xs shadow-none focus-visible:border-0 focus-visible:ring-0 disabled:cursor-not-allowed"
					/>
				)}
			</div>

			{unusedSuggestions.length > 0 && !isLocked && (
				<div className="flex flex-wrap items-center gap-1 pt-1.5">
					<span className="text-muted-foreground mr-0.5 text-[10px]">{t("tags_suggestions")}</span>
					{unusedSuggestions.slice(0, 5).map((s) => (
						<Button
							type="button"
							variant="outline"
							size="xs"
							key={s}
							onClick={() => addTag(s)}
							className="h-5 cursor-pointer px-1.5 py-0 text-[10px] font-normal"
						>
							+ {s}
						</Button>
					))}
				</div>
			)}
		</>
	);
}

type TagsExtraProps = Pick<TagsInputProps, "placeholder" | "maxTags" | "suggestions">;

export const TagsInput = connectField<string[], TagsExtraProps>(TagsInputControl);
