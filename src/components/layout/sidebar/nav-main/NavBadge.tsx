import { cn } from "@/lib/utils";

interface NavBadgeProps {
  badge?: string | number;
  className?: string;
}

/**
 * 导航项徽章（计数 / 状态标记）
 * 统一导航树三处渲染路径的样式来源
 */
export function NavBadge({ badge, className }: NavBadgeProps) {
  if (badge === undefined) {
    return null;
  }

  return (
    <span
      className={cn(
        "rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary",
        className,
      )}
    >
      {badge}
    </span>
  );
}
