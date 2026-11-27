"use client";

import { useSelector } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { useFormContext } from "@/components/form/core";
import { InfolistProvider } from "@/components/infolist/core/InfolistContext";
import { COL_SPAN_CLASSES } from "@/components/shared/grid";
import { Fieldset, Grid, Section, Tabs } from "@/components/shared/layout";
import { cn } from "cn";

import { SchemaEntryItem } from "./entryRegistry";
import { resolveSchemaText, SchemaFieldItem } from "./fieldRegistry";
import type {
	AppFormContract,
	SchemaEntrySpec,
	SchemaEvaluationContext,
	SchemaFieldSpec,
	SchemaNode,
	SchemaRendererProps,
	SchemaTranslateFn,
} from "./types";

const FALLBACK_FORM_STORE = {
	get: () => ({ values: {} as Record<string, any> }),
	subscribe: () => ({ unsubscribe: () => {} }),
};

const isEntryNode = (node: SchemaNode<any>): node is SchemaEntrySpec<any> => "kind" in node && node.kind === "entry";

function isFieldNode(node: SchemaNode<any>): node is SchemaFieldSpec<any> {
	return (
		!isEntryNode(node) &&
		node.type !== "section" &&
		node.type !== "grid" &&
		node.type !== "tabs" &&
		node.type !== "fieldset" &&
		node.type !== "custom"
	);
}

const getNodeKey = (node: SchemaNode<any>, idx: number) =>
	isEntryNode(node)
		? (node.key ?? node.name ?? `entry-${node.entryType}-${idx}`)
		: ("key" in node && node.key) || ("name" in node ? node.name : `${node.type}-${idx}`);

interface NodeRenderProps {
	node: SchemaNode<any>;
	form?: AppFormContract;
	record?: Record<string, any> | null;
	evalCtx: SchemaEvaluationContext<any>;
	disabled?: boolean;
	t: SchemaTranslateFn;
}

function SchemaChildren({
	nodes,
	form,
	record,
	evalCtx,
	disabled,
	t,
}: Omit<NodeRenderProps, "node"> & { nodes: readonly SchemaNode<any>[] }): ReactNode {
	return nodes.map((child, idx) => (
		<SchemaNodeEntry
			key={getNodeKey(child, idx)}
			node={child}
			form={form}
			record={record}
			evalCtx={evalCtx}
			disabled={disabled}
			t={t}
		/>
	));
}

function StaticSchemaNode({ node, form, record, evalCtx, disabled, t }: NodeRenderProps) {
	if (isEntryNode(node)) return <SchemaEntryItem spec={node} evalCtx={evalCtx} t={t} />;
	const child = (list: readonly SchemaNode<any>[]) => (
		<SchemaChildren nodes={list} form={form} record={record} evalCtx={evalCtx} disabled={disabled} t={t} />
	);

	switch (node.type) {
		case "section":
			return (
				<Section
					title={resolveSchemaText(node.title, node.titleKey, t)}
					description={resolveSchemaText(node.description, node.descriptionKey, t)}
					icon={node.icon}
					action={node.action}
					footer={node.footer}
					collapsible={node.collapsible}
					defaultCollapsed={node.defaultCollapsed}
					columns={node.columns}
					card={node.card}
				>
					{child(node.schema)}
				</Section>
			);
		case "grid":
			return (
				<Grid columns={node.columns} gap={node.gap}>
					{child(node.schema)}
				</Grid>
			);
		case "tabs":
			return (
				<Tabs
					defaultValue={node.defaultValue}
					tabs={node.tabs.map((tab) => ({
						value: tab.value,
						label: resolveSchemaText(tab.label, tab.labelKey, t) ?? tab.value,
						icon: tab.icon,
						badge: tab.badge,
						disabled: tab.disabled,
						columns: tab.columns,
						children: child(tab.schema),
					}))}
				/>
			);
		case "fieldset":
			return (
				<Fieldset
					legend={resolveSchemaText(node.legend, node.legendKey, t)}
					description={resolveSchemaText(node.description, node.descriptionKey, t)}
					columns={node.columns}
				>
					{child(node.schema)}
				</Fieldset>
			);
		case "custom":
			return <div className={cn(node.colSpan ? COL_SPAN_CLASSES[node.colSpan] : "w-full")}>{node.render(evalCtx)}</div>;
		default:
			return <SchemaFieldItem spec={node} form={form} isEditing={evalCtx.isEditing} disabled={disabled} t={t} />;
	}
}

function ReactiveFormConditionalNode(props: NodeRenderProps) {
	const { node, form, evalCtx, disabled } = props;
	const storeValues = useSelector(form?.store ?? FALLBACK_FORM_STORE, (state) => state?.values);
	const nextCtx: SchemaEvaluationContext<any> = {
		...evalCtx,
		values: (storeValues ?? form?.state?.values ?? evalCtx.values) as Record<string, any>,
	};
	if (node.visibleWhen && !node.visibleWhen(nextCtx)) return null;
	const conditionalDisabled = isFieldNode(node) && node.disabledWhen ? node.disabledWhen(nextCtx) : false;
	return <StaticSchemaNode {...props} evalCtx={nextCtx} disabled={Boolean(disabled || conditionalDisabled)} />;
}

function SchemaNodeEntry(props: NodeRenderProps) {
	const { node, form, evalCtx, disabled } = props;
	const fieldNode = isFieldNode(node) ? node : null;
	if (!node.visibleWhen && !fieldNode?.disabledWhen) return <StaticSchemaNode {...props} />;
	if (form?.store) return <ReactiveFormConditionalNode {...props} />;
	if (node.visibleWhen && !node.visibleWhen(evalCtx)) return null;
	return <StaticSchemaNode {...props} disabled={Boolean(disabled || fieldNode?.disabledWhen?.(evalCtx))} />;
}

/**
 * Filament v5 统一声明式 Schema 渲染器：
 * 同时驱动 Form（12 类输入控件）、Infolist（10 类只读 Entry）与混合布局容器。
 */
export function SchemaRenderer<TValues = Record<string, any>>({
	schema,
	columns,
	form: explicitForm,
	record,
	orientation = "vertical",
	dense = false,
	i18nNamespace,
	mode = record && !explicitForm ? "view" : "create",
	isEditing = mode === "edit",
	disabled,
	className,
}: SchemaRendererProps<TValues>) {
	const t = useTranslations(i18nNamespace as never) as unknown as SchemaTranslateFn;
	const context = useFormContext();
	const resolvedForm = (explicitForm ?? context.form) as AppFormContract | undefined;
	const nodes: readonly SchemaNode<any>[] = schema ?? [];
	if (nodes.length === 0) return null;

	const evalCtx: SchemaEvaluationContext<any> = {
		values: (resolvedForm?.state?.values ?? record ?? {}) as Record<string, any>,
		record: record as Record<string, any> | null | undefined,
		isEditing,
		mode,
	};

	const rendered = (
		<SchemaChildren
			nodes={nodes}
			form={resolvedForm}
			record={evalCtx.record}
			evalCtx={evalCtx}
			disabled={disabled}
			t={t}
		/>
	);
	const layoutNode = columns ? (
		<Grid columns={columns} className={className}>
			{rendered}
		</Grid>
	) : (
		<div className={cn("flex flex-col gap-4", className)}>{rendered}</div>
	);

	if (record !== undefined || mode === "view") {
		return (
			<InfolistProvider record={record ?? undefined} orientation={orientation} dense={dense}>
				{layoutNode}
			</InfolistProvider>
		);
	}
	return layoutNode;
}
