import { useTranslations } from "next-intl";
import { Filter } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

export interface FilterTriggerProps extends React.ComponentProps<typeof Button> {
  activeCount?: number;
}

export const FilterTrigger = React.forwardRef<HTMLButtonElement, FilterTriggerProps>(
  ({ activeCount = 0, className, ...props }, ref) => {
    const t = useTranslations("table");

    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        className={cn("h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground", className)}
        {...props}
      >
        <Filter className="size-3.5" />
        <span>{t("filter_trigger")}</span>
        {activeCount > 0 ? (
          <Badge
            variant="secondary"
            className="bg-primary/15 text-primary flex size-4.5 items-center justify-center rounded-full p-0 font-mono text-[10px] font-semibold"
          >
            {activeCount}
          </Badge>
        ) : null}
      </Button>
    );
  },
);

FilterTrigger.displayName = "FilterTrigger";
