import type { ButtonHTMLAttributes } from "react";

export interface NotificationTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  unreadCount: number;
  onPrefetch?: () => void;
}
