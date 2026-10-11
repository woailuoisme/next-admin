import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface SheetFilterLayoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  sheetTitle?: string;
  sheetDescription?: string;
  activeCount?: number;
  showReset?: boolean;
  onReset?: () => void;
  deferFilters?: boolean;
  onApply: () => void;
}

export const SheetFilterLayout: React.FC<SheetFilterLayoutProps> = ({
  open,
  onOpenChange,
  trigger,
  children,
  sheetTitle = "Filters",
  sheetDescription = "Filter and refine table records.",
  activeCount = 0,
  showReset = false,
  onReset,
  deferFilters = false,
  onApply,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col overflow-y-auto p-6 sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-base font-semibold">{sheetTitle}</SheetTitle>
              {activeCount > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary font-mono text-[10px]">
                  {activeCount} active
                </Badge>
              )}
            </div>
            {showReset && onReset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-6 px-2 text-xs"
              >
                Reset
              </Button>
            )}
          </div>
          <SheetDescription className="text-muted-foreground text-xs">{sheetDescription}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 py-4">{children}</div>

        <SheetFooter className="flex flex-row items-center justify-end gap-2 border-t pt-4">
          <SheetClose asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Cancel
            </Button>
          </SheetClose>
          <Button size="sm" onClick={onApply} className="h-8 px-4 text-xs font-medium">
            {deferFilters ? "Apply filters" : "Done"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
