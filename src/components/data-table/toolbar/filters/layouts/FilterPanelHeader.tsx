import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface FilterPanelHeaderProps {
  title?: string;
  activeCount: number;
  showReset: boolean;
  onReset: () => void;
}

export const FilterPanelHeader: React.FC<FilterPanelHeaderProps> = ({
  title = "Filters",
  activeCount,
  showReset,
  onReset,
}) => {
  return (
    <div className="flex items-center justify-between border-b pb-2.5">
      <div className="flex items-center gap-2">
        <span className="text-foreground text-xs font-semibold sm:text-sm">{title}</span>
        {activeCount > 0 && (
          <Badge variant="secondary" className="bg-primary/10 text-primary font-mono text-[10px]">
            {activeCount} active
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
          Reset
        </Button>
      )}
    </div>
  );
};
