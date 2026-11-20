import { useTranslations } from "next-intl";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "cn";

export interface PageSkeletonRegionProps extends ComponentPropsWithoutRef<"div"> {
  ariaLabel?: string;
}

/**
 * 页面级骨架屏统一语义容器：提供标准 `space-y-6` 纵向间距与 `role="status"` / `aria-busy` 无障碍播报。
 */
export function PageSkeletonRegion({ ariaLabel, className, children, ...props }: PageSkeletonRegionProps) {
  const t = useTranslations("common");

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={ariaLabel ?? t("loading_page_aria")}
      className={cn("space-y-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}
