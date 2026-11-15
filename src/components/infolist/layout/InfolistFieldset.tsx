"use client";

import * as React from "react";

import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field";
import { cn } from "cn";

import type { InfolistFieldsetProps } from "./types";

import { hasRenderableNode } from "../core/utils";
import { InfolistGrid } from "./InfolistGrid";

export const InfolistFieldset = React.memo(function InfolistFieldset({
  legend,
  description,
  columns,
  className,
  children,
  ...props
}: InfolistFieldsetProps) {
  return (
    <FieldSet
      className={cn(
        "w-full gap-0 rounded-xl border border-border/80 bg-card/30 p-4 pt-2.5 text-left transition-colors",
        className,
      )}
      {...props}
    >
      {hasRenderableNode(legend) && (
        <FieldLegend className="text-foreground mb-0 px-2 text-xs font-semibold tracking-tight data-[variant=legend]:text-xs">
          {legend}
        </FieldLegend>
      )}
      {hasRenderableNode(description) && (
        <FieldDescription className="text-muted-foreground mb-2 px-1 text-xs">{description}</FieldDescription>
      )}
      <div className="w-full pt-1.5">
        {columns ? <InfolistGrid columns={columns}>{children}</InfolistGrid> : children}
      </div>
    </FieldSet>
  );
});
