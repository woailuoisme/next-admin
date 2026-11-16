import type { NavGroup } from "../sidebar/types";

export interface GlobalSearchProps {
  className?: string;
  customGroups?: NavGroup[];
}

export interface GlobalSearchTriggerProps {
  onClick?: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  className?: string;

  triggerText?: string;
  ariaLabel?: string;
}

export interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customGroups?: NavGroup[];

  placeholder?: string;
  emptyText?: string;
}
