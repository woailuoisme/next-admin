import { memo } from "react";

import { cn } from "@/lib/utils";

import type { StatCardActionsProps } from "./types";

export const StatCardActions = memo(function StatCardActions({
  className,
  children,
  onClick,
  ...props
}: StatCardActionsProps) {
  return (
    <div
      className={cn("flex shrink-0 items-center gap-1.5", className)}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </div>
  );
});
