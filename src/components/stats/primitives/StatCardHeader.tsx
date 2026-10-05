import { memo } from "react";

import { cn } from "@/lib/utils";

import type { StatCardHeaderProps } from "./types";

export const StatCardHeader = memo(function StatCardHeader({
  className,
  children,
  ...props
}: StatCardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-2", className)} {...props}>
      {children}
    </div>
  );
});
