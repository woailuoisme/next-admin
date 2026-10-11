import { useMemoizedFn } from "ahooks";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { StatCardActionsProps } from "./types";

export const StatCardActions = memo(function StatCardActions({
  className,
  children,
  onClick,
  ...props
}: StatCardActionsProps) {
  const handleClick = useMemoizedFn((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClick?.(e);
  });

  return (
    <div className={cn("flex shrink-0 items-center gap-1.5", className)} onClick={handleClick} {...props}>
      {children}
    </div>
  );
});
