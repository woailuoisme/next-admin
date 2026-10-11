import { memo } from "react";

import { cn } from "@/lib/utils";

import type { ActionItem, ActionsCellProps } from "./types";

import { DropdownActionsMenu } from "./DropdownActionsMenu";
import { QuickActionButton } from "./QuickActionButton";

const ALIGN_CLASSES = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
} as const;

const EMPTY_QUICK_ACTIONS: ActionItem<any>[] = [];
const EMPTY_DROPDOWN_ACTIONS: ActionItem<any>[] = [];

function ActionsCellInner<TData = unknown>({
  row,
  quickActions = EMPTY_QUICK_ACTIONS,
  dropdownActions = EMPTY_DROPDOWN_ACTIONS,
  maxQuickActions = 2,
  align = "center",
  moreActionsLabel = "更多操作",
  className,
}: ActionsCellProps<TData>) {
  // Filter out hidden actions
  const visibleQuick = quickActions.filter((a) =>
    typeof a.hidden === "function" ? !a.hidden(row) : !a.hidden,
  );
  const visibleDropdown = dropdownActions.filter((a) =>
    typeof a.hidden === "function" ? !a.hidden(row) : !a.hidden,
  );

  // Partition if visibleQuick exceeds maxQuickActions
  const inlineActions = visibleQuick.slice(0, maxQuickActions);
  const overflowActions = [...visibleQuick.slice(maxQuickActions), ...visibleDropdown];

  return (
    <div
      className={cn("flex items-center gap-1", ALIGN_CLASSES[align], className)}
      onClick={(e) => e.stopPropagation()}
    >
      {inlineActions.map((action, index) => (
        <QuickActionButton
          key={action.id || (typeof action.label === "string" ? action.label : `quick-${index}`)}
          action={action}
          row={row}
          index={index}
        />
      ))}

      <DropdownActionsMenu actions={overflowActions} row={row} moreActionsLabel={moreActionsLabel} />
    </div>
  );
}

export const ActionsCell = memo(ActionsCellInner) as typeof ActionsCellInner;
