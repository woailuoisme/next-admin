import { cn } from "cn";
import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface PopoverFilterLayoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  columnsCount?: number;
}

export const PopoverFilterLayout: React.FC<PopoverFilterLayoutProps> = ({
  open,
  onOpenChange,
  trigger,
  children,
  columnsCount = 1,
}) => {
  const popoverWidthClass =
    columnsCount === 1
      ? "w-80 sm:w-96"
      : columnsCount === 3
        ? "w-[90vw] sm:w-[640px] md:w-[760px]"
        : columnsCount === 4
          ? "w-[95vw] sm:w-[760px] md:w-[900px]"
          : "w-[90vw] sm:w-[520px] md:w-[580px]";

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("border-border/70 p-4 shadow-xl", popoverWidthClass)}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};
