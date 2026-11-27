"use client";

import { MarkdownPlugin } from "@platejs/markdown";
import { BoldIcon, Code2Icon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { KEYS, type Value } from "platejs";
import { Plate, type PlateEditor, usePlateEditor } from "platejs/react";
import { useEffect, useRef } from "react";

import { BasicNodesKit } from "@/components/editor/plugins/basic-nodes-kit";
import { CodeBlockKit } from "@/components/editor/plugins/code-block-kit";
import { ColumnKit } from "@/components/editor/plugins/column-kit";
import { DateKit } from "@/components/editor/plugins/date-kit";
import { DndKit } from "@/components/editor/plugins/dnd-kit";
import { LinkKit } from "@/components/editor/plugins/link-kit";
import { ListKit } from "@/components/editor/plugins/list-kit";
import { MarkdownKit } from "@/components/editor/plugins/markdown-kit";
import { MathKit } from "@/components/editor/plugins/math-kit";
import { TableKit } from "@/components/editor/plugins/table-kit";
import { TocKit } from "@/components/editor/plugins/toc-kit";
import { isFocusLeaving } from "@/components/shared/focus";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { InlineEquationToolbarButton } from "@/components/ui/equation-toolbar-button";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { FloatingToolbar } from "@/components/ui/floating-toolbar";
import { RedoToolbarButton, UndoToolbarButton } from "@/components/ui/history-toolbar-button";
import { IndentToolbarButton, OutdentToolbarButton } from "@/components/ui/indent-toolbar-button";
import { InsertToolbarButton } from "@/components/ui/insert-toolbar-button";
import { LinkToolbarButton } from "@/components/ui/link-toolbar-button";
import {
	BulletedListToolbarButton,
	NumberedListToolbarButton,
	TodoListToolbarButton,
} from "@/components/ui/list-toolbar-button";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import { TableToolbarButton } from "@/components/ui/table-toolbar-button";
import { ToolbarGroup } from "@/components/ui/toolbar";
import { TurnIntoToolbarButton } from "@/components/ui/turn-into-toolbar-button";
import { cn } from "cn";

const EDITOR_PLUGINS = [
	...BasicNodesKit,
	...ListKit,
	...LinkKit,
	...CodeBlockKit,
	...TableKit,
	...MathKit,
	...DateKit,
	...ColumnKit,
	...TocKit,
	...DndKit,
	...MarkdownKit,
];

const createEmptyValue = (): Value => [{ children: [{ text: "" }], type: KEYS.p }];

/** 固定工具栏与浮动工具栏共用的字符样式按钮组 */
function MarkButtons() {
	const t = useTranslations("form");

	return (
		<>
			<MarkToolbarButton nodeType={KEYS.bold} tooltip={t("editor_bold")} aria-label={t("editor_bold")}>
				<BoldIcon />
			</MarkToolbarButton>
			<MarkToolbarButton nodeType={KEYS.italic} tooltip={t("editor_italic")} aria-label={t("editor_italic")}>
				<ItalicIcon />
			</MarkToolbarButton>
			<MarkToolbarButton nodeType={KEYS.underline} tooltip={t("editor_underline")} aria-label={t("editor_underline")}>
				<UnderlineIcon />
			</MarkToolbarButton>
			<MarkToolbarButton nodeType={KEYS.strikethrough} tooltip={t("editor_strike")} aria-label={t("editor_strike")}>
				<StrikethroughIcon />
			</MarkToolbarButton>
			<MarkToolbarButton nodeType={KEYS.code} tooltip={t("editor_code")} aria-label={t("editor_code")}>
				<Code2Icon />
			</MarkToolbarButton>
		</>
	);
}

function deserializeMarkdown(editor: PlateEditor, markdown: string): Value {
	if (!markdown.trim()) {
		return createEmptyValue();
	}
	try {
		const nodes = editor.getApi(MarkdownPlugin).markdown.deserialize(markdown);
		return nodes.length > 0 ? nodes : createEmptyValue();
	} catch {
		return [{ children: [{ text: markdown }], type: KEYS.p }];
	}
}

export interface PlateEditorCoreProps {
	id?: string;
	value: string;
	onChange?: (value: string) => void;
	onBlur?: () => void;
	placeholder?: string;
	minHeight?: string | number;
	maxHeight?: string | number;
	disabled?: boolean;
	readOnly?: boolean;
	hasError?: boolean;
	describedBy?: string;
	className?: string;
}

export function PlateEditorCore({
	id,
	value,
	onChange,
	onBlur,
	placeholder,
	minHeight = 160,
	maxHeight,
	disabled = false,
	readOnly = false,
	hasError = false,
	describedBy,
	className,
}: PlateEditorCoreProps) {
	"use no memo";

	const t = useTranslations("form");
	const isInteractive = !disabled && !readOnly;
	const lastMarkdownRef = useRef(value);
	const isSyncingRef = useRef(false);

	const editor = usePlateEditor({
		id,
		plugins: EDITOR_PLUGINS,
		value: (plateEditor) => deserializeMarkdown(plateEditor, value),
	});

	useEffect(() => {
		if (value === lastMarkdownRef.current) return;
		const nextNodes = deserializeMarkdown(editor, value);
		isSyncingRef.current = true;
		try {
			const canonical = editor.getApi(MarkdownPlugin).markdown.serialize({ value: nextNodes });
			lastMarkdownRef.current = canonical || value;
		} catch {
			lastMarkdownRef.current = value;
		}
		editor.tf.setValue(nextNodes);
		const timer = setTimeout(() => {
			isSyncingRef.current = false;
		}, 0);
		return () => clearTimeout(timer);
	}, [editor, value]);

	const handleContainerBlur = (event: React.FocusEvent<HTMLDivElement>) => {
		if (isFocusLeaving(event)) onBlur?.();
	};

	return (
		<div
			data-invalid={hasError || undefined}
			className={cn(
				"bg-background overflow-hidden rounded-lg border transition-colors",
				hasError
					? "border-destructive focus-within:ring-destructive/20 focus-within:ring-2"
					: "border-input focus-within:ring-ring/20 focus-within:ring-2",
				disabled && "cursor-not-allowed opacity-50",
				className,
			)}
			onBlur={handleContainerBlur}
		>
			<Plate
				editor={editor}
				onChange={({ value: nextValue }) => {
					if (isSyncingRef.current) return;
					const nextMarkdown = editor.getApi(MarkdownPlugin).markdown.serialize({ value: nextValue });
					if (nextMarkdown === lastMarkdownRef.current) return;
					lastMarkdownRef.current = nextMarkdown;
					onChange?.(nextMarkdown);
				}}
			>
				{isInteractive ? (
					<FixedToolbar className="bg-muted/30 justify-start gap-0.5 rounded-t-lg px-1.5 py-1">
						<ToolbarGroup>
							<UndoToolbarButton aria-label={t("editor_undo")} />
							<RedoToolbarButton aria-label={t("editor_redo")} />
						</ToolbarGroup>
						<ToolbarGroup>
							<InsertToolbarButton />
							<TurnIntoToolbarButton />
						</ToolbarGroup>
						<ToolbarGroup>
							<MarkButtons />
						</ToolbarGroup>
						<ToolbarGroup>
							<BulletedListToolbarButton />
							<NumberedListToolbarButton />
							<TodoListToolbarButton />
							<OutdentToolbarButton aria-label={t("editor_outdent")} />
							<IndentToolbarButton aria-label={t("editor_indent")} />
						</ToolbarGroup>
						<ToolbarGroup>
							<LinkToolbarButton aria-label={t("editor_link")} />
							<TableToolbarButton />
							<InlineEquationToolbarButton aria-label={t("editor_equation")} />
						</ToolbarGroup>
					</FixedToolbar>
				) : null}

				<EditorContainer style={{ minHeight, maxHeight }} className={cn(!isInteractive && "bg-muted/30")}>
					<Editor
						id={id}
						variant="none"
						disabled={disabled}
						readOnly={readOnly}
						placeholder={placeholder ?? t("editor_placeholder")}
						aria-invalid={hasError || undefined}
						aria-describedby={describedBy}
						className="min-h-[inherit] px-4 py-3 text-sm focus-visible:outline-none"
					/>
				</EditorContainer>

				{isInteractive ? (
					<FloatingToolbar>
						<ToolbarGroup>
							<MarkButtons />
						</ToolbarGroup>
						<ToolbarGroup>
							<LinkToolbarButton aria-label={t("editor_link")} />
							<InlineEquationToolbarButton aria-label={t("editor_equation")} />
						</ToolbarGroup>
					</FloatingToolbar>
				) : null}
			</Plate>
		</div>
	);
}
