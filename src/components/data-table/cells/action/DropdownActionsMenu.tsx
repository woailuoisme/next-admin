import { MoreHorizontal } from "lucide-react";
import { memo } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { ActionItem } from "./types";

interface DropdownActionsMenuProps<TData> {
  actions: ActionItem<TData>[];
  row: TData;
  /** 更多操作按钮无障碍说明（由 ActionsCell 注入已本地化文案） */
  moreActionsLabel: string;
}

function DropdownActionsMenuInner<TData>({ actions, row, moreActionsLabel }: DropdownActionsMenuProps<TData>) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <MoreHorizontal className="size-3.5" />
          <span className="sr-only">{moreActionsLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {actions.map((action, idx) => {
          const labelText = typeof action.label === "string" ? action.label : undefined;
          const itemKey = action.id || labelText || `overflow-${idx}`;

          if (action.separator) {
            return <DropdownMenuSeparator key={action.id ? `sep-${action.id}` : `sep-${idx}`} />;
          }

          const Icon = action.icon;
          const isDisabled = typeof action.disabled === "function" ? action.disabled(row) : !!action.disabled;

          return (
            <DropdownMenuItem
              key={itemKey}
              variant={action.destructive ? "destructive" : "default"}
              disabled={isDisabled}
              onSelect={() => action.onClick(row)}
              className="cursor-pointer gap-2 text-xs"
            >
              {Icon && <Icon className="size-3.5 shrink-0" />}
              <span>{action.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const DropdownActionsMenu = memo(DropdownActionsMenuInner) as typeof DropdownActionsMenuInner;
