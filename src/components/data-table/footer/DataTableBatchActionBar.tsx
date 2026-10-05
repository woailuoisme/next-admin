import { CheckSquare2, X } from "lucide-react";
import { memo, type ReactElement, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

export interface DataTableBatchActionBarProps<TData = any> {
  selectedRows: TData[];
  onClearSelection: () => void;
  batchActions?: (selectedRows: TData[], clearSelection: () => void) => ReactNode;
}

function DataTableBatchActionBarInner<TData = any>({
  selectedRows,
  onClearSelection,
  batchActions,
}: DataTableBatchActionBarProps<TData>) {
  if (selectedRows.length === 0) return null;

  return (
    <div className="animate-in border-primary/30 bg-background/95 fade-in slide-in-from-bottom-3 dark:border-primary/40 fixed bottom-6 left-1/2 z-50 flex w-fit max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-full border px-4 py-2 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2">
        <CheckSquare2 className="text-primary size-4" />
        <span className="text-xs font-semibold">{selectedRows.length} selected</span>
      </div>

      <div className="bg-border h-4 w-px" />

      {batchActions && (
        <div className="flex items-center gap-2">
          {batchActions(selectedRows, onClearSelection)}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="text-muted-foreground hover:text-foreground h-7 gap-1 rounded-full px-2 text-xs"
      >
        <X className="size-3.5" />
        <span>Deselect</span>
      </Button>
    </div>
  );
}

export const DataTableBatchActionBar = memo(DataTableBatchActionBarInner) as <TData = any>(
  props: DataTableBatchActionBarProps<TData>,
) => ReactElement | null;
