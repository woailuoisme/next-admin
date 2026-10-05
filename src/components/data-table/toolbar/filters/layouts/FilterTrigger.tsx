import { Filter } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterTriggerProps extends React.ComponentProps<typeof Button> {
  activeCount?: number;
}

export const FilterTrigger = React.forwardRef<HTMLButtonElement, FilterTriggerProps>(
  ({ activeCount = 0, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        className={cn("h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground", className)}
        {...props}
      >
        <Filter className="size-3.5" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="bg-primary/15 text-primary flex size-4.5 items-center justify-center rounded-full font-mono text-[10px] font-semibold">
            {activeCount}
          </span>
        )}
      </Button>
    );
  },
);

FilterTrigger.displayName = "FilterTrigger";
