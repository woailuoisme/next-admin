"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "cn";

import type { StatCardTheme, StatDensity } from "../shared/types";

import { useStatCardContext } from "./StatCardContext";
import { StatCardHelpTooltip } from "./StatCardHelpTooltip";
import { StatCardIcon } from "./StatCardIcon";
import { DENSITY_STYLES } from "./types";

export interface StatCardHeadlineProps {
  title: ReactNode;
  /** 标题旁帮助说明；缺省时不渲染问号 */
  description?: string;
  /** 右侧徽标 */
  badge?: ReactNode;
  /** 右侧操作区（通用 StatCard 专用） */
  actions?: ReactNode;
  /** 右侧自定义尾巴（如 LiveStatCard 的状态胶囊） */
  trailing?: ReactNode;
  /** 右上角图标徽章 */
  icon?: LucideIcon;
  theme?: StatCardTheme;
  density?: StatDensity;
}

/**
 * 四类 StatCard 共用的顶栏：标题 + 帮助提示 | 徽标、操作 / 尾巴、图标
 */
export function StatCardHeadline({
  title,
  description,
  badge,
  actions,
  trailing,
  icon: Icon,
  theme,
  density,
}: StatCardHeadlineProps) {
  const ctx = useStatCardContext();
  const resolvedDensity = density ?? ctx.density;
  const dStyles = DENSITY_STYLES[resolvedDensity] ?? DENSITY_STYLES.compact;

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className={cn("truncate font-medium tracking-tight text-muted-foreground", dStyles.titleText)}>
          {title}
        </span>
        {description ? <StatCardHelpTooltip description={description} /> : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {badge}
        {actions ? <div className="relative z-10 flex items-center gap-1">{actions}</div> : null}
        {trailing}
        {Icon ? <StatCardIcon icon={Icon} theme={theme} density={resolvedDensity} /> : null}
      </div>
    </div>
  );
}
