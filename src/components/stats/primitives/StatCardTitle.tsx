import { memo } from "react";

import { cn } from "@/lib/utils";

import type { StatCardTitleProps } from "./types";

import { useStatCardContext } from "./StatCardContext";
import { DENSITY_STYLES } from "./types";

export const StatCardTitle = memo(function StatCardTitle({
  density,
  className,
  children,
  ...props
}: StatCardTitleProps) {
  const context = useStatCardContext();
  const resolvedDensity = density ?? context.density ?? "compact";
  const dStyles = DENSITY_STYLES[resolvedDensity] ?? DENSITY_STYLES.compact;

  return (
    <span
      className={cn("truncate font-medium text-muted-foreground", dStyles.titleText, className)}
      {...props}
    >
      {children}
    </span>
  );
});
