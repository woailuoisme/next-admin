import type { LucideIcon } from "lucide-react";
import { memo, type ReactNode } from "react";

import type { StatCardTheme, StatDensity } from "../shared/types";

import { StatCardActions } from "./StatCardActions";
import { StatCardHeader } from "./StatCardHeader";
import { StatCardHelpTooltip } from "./StatCardHelpTooltip";
import { StatCardIcon } from "./StatCardIcon";
import { StatCardTitle } from "./StatCardTitle";

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
export const StatCardHeadline = memo(function StatCardHeadline({
  title,
  description,
  badge,
  actions,
  trailing,
  icon: Icon,
  theme,
  density,
}: StatCardHeadlineProps) {
  return (
    <StatCardHeader>
      <div className="flex min-w-0 items-center gap-1.5">
        <StatCardTitle density={density}>{title}</StatCardTitle>
        {description ? <StatCardHelpTooltip description={description} /> : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {badge}
        {actions ? <StatCardActions>{actions}</StatCardActions> : null}
        {trailing}
        {Icon ? <StatCardIcon icon={Icon} theme={theme} density={density} /> : null}
      </div>
    </StatCardHeader>
  );
});
