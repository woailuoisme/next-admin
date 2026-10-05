import * as React from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { InfolistProps } from "./types";

import { InfolistProvider } from "./InfolistContext";

export const Infolist = React.forwardRef<HTMLDivElement, InfolistProps>(function Infolist(
  { record, orientation = "vertical", dense = false, className, children, ...props },
  ref,
) {
  return (
    <TooltipProvider>
      <InfolistProvider record={record} orientation={orientation} dense={dense}>
        <div ref={ref} className={cn("w-full space-y-6 text-foreground", className)} {...props}>
          {children}
        </div>
      </InfolistProvider>
    </TooltipProvider>
  );
});

Infolist.displayName = "Infolist";
