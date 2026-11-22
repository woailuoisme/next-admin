"use client";

import { hasRenderableNode } from "@/components/shared/renderable";
import { FieldSet, FieldLegend } from "@/components/ui/field";
import { cn } from "cn";

import { Grid } from "./Grid";
import type { FieldsetProps } from "./types";

/**
 * 通用字段组容器：统一替代 `FormFieldset` 与 `InfolistFieldset`。
 */
export function Fieldset({ legend, description, columns, className, children, ...props }: FieldsetProps) {
	const showLegend = hasRenderableNode(legend);
	const showDescription = hasRenderableNode(description);

	return (
		<FieldSet
			className={cn("border-border/80 bg-muted/10 w-full rounded-xl border p-4 text-left", className)}
			{...props}
		>
			{showLegend && (
				<FieldLegend className="bg-background text-foreground px-2 text-xs font-semibold">{legend}</FieldLegend>
			)}
			{showDescription && <p className="text-muted-foreground -mt-1 mb-2 text-xs">{description}</p>}
			<div className="w-full pt-1">{columns ? <Grid columns={columns}>{children}</Grid> : children}</div>
		</FieldSet>
	);
}
