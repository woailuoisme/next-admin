export interface GlobalSearchProps {
  className?: string;
}

export interface GlobalSearchTriggerProps {
  onClick?: () => void;
  onMouseEnter?: () => void;
  className?: string;

  triggerText?: string;
  ariaLabel?: string;
}

export interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  placeholder?: string;
  emptyText?: string;
}
