import { memo } from "react";

import { cn } from "@/lib/utils";

import type { StatCardIconProps } from "./types";

import { getStatTheme } from "../shared/theme";
import { useStatCardContext } from "./StatCardContext";
import { DENSITY_STYLES } from "./types";

export const StatCardIcon = memo(function StatCardIcon({
  icon: Icon,
  theme,
  density,
  isInteractive,
  className,
  ...props
}: StatCardIconProps) {
  const context = useStatCardContext();
  const resolvedTheme = theme ?? context.theme ?? "primary";
  const resolvedDensity = density ?? context.density ?? "compact";
  const resolvedInteractive = isInteractive ?? context.isInteractive;

  if (!Icon) return null;

  const themeConfig = getStatTheme(resolvedTheme);
  const dStyles = DENSITY_STYLES[resolvedDensity] ?? DENSITY_STYLES.compact;

  return (
    <div
      className={cn(
        "border transition-transform duration-200",
        resolvedInteractive && "group-hover:scale-105",
        dStyles.iconContainer,
        themeConfig.iconBadge,
        className,
      )}
      {...props}
    >
      <Icon className={dStyles.iconSize} />
    </div>
  );
});
