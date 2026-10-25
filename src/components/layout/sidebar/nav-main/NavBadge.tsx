import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

export interface NavBadgeProps {
  badge?: string | number;
  className?: string;
}

/**
 * 导航项徽章（计数 / 状态标记）
 * 统一复用基础组件库 Badge，符合设计系统规范
 */
export const NavBadge = memo(function NavBadge({ badge, className }: NavBadgeProps) {
  if (badge === undefined) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-primary/20 bg-primary/10 text-primary h-4.5 rounded-md px-1.5 py-0 text-[10px] font-semibold select-none",
        className,
      )}
    >
      {badge}
    </Badge>
  );
});
