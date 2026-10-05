import * as React from "react";

import { cn } from "@/lib/utils";

import type { InfolistFieldsetProps } from "./types";

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
    <fieldset
      className={cn(
        "w-full rounded-xl border border-border/80 bg-card/30 p-4 pt-2.5 text-left transition-colors",
        className,
      )}
      {...props}
    >
      {legend && (
        <legend className="text-foreground px-2 text-xs font-semibold tracking-tight">
          {legend}
        </legend>
      )}
      {description && <p className="text-muted-foreground mb-3 px-1 text-xs">{description}</p>}
      <div className="w-full pt-1.5">
        {columns ? <InfolistGrid columns={columns}>{children}</InfolistGrid> : children}
      </div>
    </fieldset>
  );
});
