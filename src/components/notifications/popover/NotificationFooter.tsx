import { ArrowRight } from "lucide-react";
import { memo } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { NotificationFooterProps } from "./types";

export const NotificationFooter = memo(function NotificationFooter({
  total,
  onGotoOverview,
  className,
}: NotificationFooterProps) {
  const t = useTranslations("notification");

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-border/50 bg-muted/15 px-4 py-2.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <span className="text-[11px]">{t("total_records", { count: total })}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onGotoOverview}
        className="group text-muted-foreground hover:text-foreground h-auto gap-1 p-0 text-xs font-normal hover:bg-transparent"
      >
        <span>{t("goto_overview")}</span>
        <ArrowRight className="size-3 transition-transform duration-150 group-hover:translate-x-0.5" />
      </Button>
    </div>
  );
});
