import { useTranslations } from "next-intl";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface FilterPanelHeaderProps {
  title?: string;
  activeCount: number;
  showReset: boolean;
  onReset: () => void;
}

export const FilterPanelHeader: React.FC<FilterPanelHeaderProps> = ({ title, activeCount, showReset, onReset }) => {
  const t = useTranslations("table");
  const displayTitle = title ?? t("filter_title");

  return (
    <div className="flex items-center justify-between border-b pb-2.5">
      <div className="flex items-center gap-2">
        <span className="text-foreground text-xs font-semibold sm:text-sm">{displayTitle}</span>
        {activeCount > 0 && (
          <Badge variant="secondary" className="bg-primary/10 text-primary font-mono text-[10px]">
            {t("filter_active_count", { count: activeCount })}
          </Badge>
        )}
      </div>

      {showReset && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-6 px-2 text-xs"
        >
          {t("filter_reset")}
        </Button>
      )}
    </div>
  );
};
