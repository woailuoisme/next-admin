"use client";

import type { ReactNode } from "react";

import { InfolistCallout } from "@/components/infolist/callout";
import type { CalloutColor } from "@/components/infolist/callout/types";
import { getNestedValue } from "@/components/infolist/core/InfolistContext";
import { ColorEntry, IconEntry, ImageEntry, KeyValueEntry, TextEntry } from "@/components/infolist/entries";
import type { EntrySemanticColor } from "@/components/infolist/entries/types";

import { resolveSchemaText } from "./fieldRegistry";
import type { SchemaEntrySpec, SchemaEntryType, SchemaEvaluationContext, SchemaTranslateFn } from "./types";

interface EntryRenderArgs {
	spec: SchemaEntrySpec<any>;
	evalCtx: SchemaEvaluationContext<any>;
	resolvedValue: unknown;
	label?: ReactNode;
	hint?: ReactNode;
	tooltip?: ReactNode;
	t: SchemaTranslateFn;
}

type EntryRenderer = (args: EntryRenderArgs) => ReactNode;

function baseEntryProps({ spec, label, hint, tooltip }: EntryRenderArgs) {
	return {
		name: spec.name,
		label,
		hint,
		tooltip,
		helperText: spec.helperText,
		colSpan: spec.colSpan,
		inline: spec.inline,
		className: spec.className,
	};
}

function renderMappedTextEntry(args: EntryRenderArgs, format: "text" | "badge" | "date" | "currency" | "number") {
	const { spec, resolvedValue } = args;
	const rawKey = resolvedValue != null ? String(resolvedValue) : "";
	const mappedValue = rawKey && spec.labelMap?.[rawKey] ? spec.labelMap[rawKey] : resolvedValue;
	const mappedColor =
		(rawKey && spec.colorMap?.[rawKey]) || ((spec.color as EntrySemanticColor | undefined) ?? "neutral");

	return (
		<TextEntry
			{...baseEntryProps(args)}
			value={mappedValue}
			format={format}
			color={mappedColor}
			currency={spec.currency}
			decimals={spec.decimals}
			dateOptions={spec.dateOptions}
			prefix={spec.prefix}
			suffix={spec.suffix}
			copyable={spec.copyable}
			placeholder={spec.placeholder}
			href={spec.href}
			openInNewTab={spec.openInNewTab}
		/>
	);
}

export const ENTRY_REGISTRY: Record<SchemaEntryType, EntryRenderer> = {
	text: (args) => renderMappedTextEntry(args, "text"),
	badge: (args) => renderMappedTextEntry(args, "badge"),
	date: (args) => renderMappedTextEntry(args, "date"),
	currency: (args) => renderMappedTextEntry(args, "currency"),
	number: (args) => renderMappedTextEntry(args, "number"),

	icon: (args) => (
		<IconEntry
			{...baseEntryProps(args)}
			value={args.resolvedValue as boolean | string | number | null | undefined}
			color={args.spec.color as EntrySemanticColor | undefined}
			icon={args.spec.icon as any}
			iconMap={args.spec.iconMap as any}
			colorMap={args.spec.colorMap}
			text={resolveSchemaText(args.spec.text, args.spec.textKey, args.t)}
			placeholder={args.spec.placeholder}
		/>
	),

	image: (args) => (
		<ImageEntry
			{...baseEntryProps(args)}
			value={args.resolvedValue as string | string[] | null | undefined}
			alt={args.spec.alt}
			shape={args.spec.shape}
			size={args.spec.size}
			lightbox={args.spec.lightbox}
			fallback={args.spec.fallback}
		/>
	),

	color: (args) => (
		<ColorEntry
			{...baseEntryProps(args)}
			value={args.resolvedValue as string | null | undefined}
			showText={args.spec.showText}
			copyable={Boolean(args.spec.copyable ?? true)}
			placeholder={args.spec.placeholder}
		/>
	),

	keyValue: (args) => (
		<KeyValueEntry
			{...baseEntryProps(args)}
			value={args.resolvedValue as Record<string, any> | Array<{ key: string; value: any }> | null | undefined}
			variant={args.spec.variant}
			placeholder={args.spec.placeholder}
		/>
	),

	callout: ({ spec, t }) => (
		<InfolistCallout
			color={spec.color as CalloutColor | undefined}
			title={resolveSchemaText(spec.title, spec.titleKey, t)}
			description={resolveSchemaText(spec.description, spec.descriptionKey, t)}
			icon={spec.icon as any}
			compact={spec.compact}
			dismissible={spec.dismissible}
			actions={spec.actions}
			colSpan={spec.colSpan}
			className={spec.className}
		/>
	),
};

export function SchemaEntryItem({
	spec,
	evalCtx,
	t,
}: {
	spec: SchemaEntrySpec<any>;
	evalCtx: SchemaEvaluationContext<any>;
	t: SchemaTranslateFn;
}) {
	const sourceObject = evalCtx.record ?? evalCtx.values;
	let resolvedValue: unknown;
	if (spec.resolveValue) {
		resolvedValue = spec.resolveValue(evalCtx);
	} else if (spec.value !== undefined) {
		resolvedValue = spec.value;
	} else if (spec.name && sourceObject && typeof sourceObject === "object") {
		resolvedValue = getNestedValue(sourceObject, spec.name);
	}

	const renderEntry = ENTRY_REGISTRY[spec.entryType];
	return renderEntry({
		spec,
		evalCtx,
		resolvedValue,
		label: resolveSchemaText(spec.label, spec.labelKey, t),
		hint: resolveSchemaText(spec.hint, spec.hintKey, t),
		tooltip: resolveSchemaText(spec.tooltip, spec.tooltipKey, t),
		t,
	});
}
