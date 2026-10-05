import { forwardRef, memo, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface RichEditorToolbarItemProps extends React.ComponentPropsWithoutRef<"button"> {
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  className?: string;
}

export const RichEditorToolbarItem = memo(
  forwardRef<HTMLButtonElement, RichEditorToolbarItemProps>(function RichEditorToolbarItem(
    { label, isActive, disabled, onClick, children, className, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-md text-xs transition-colors",
          "hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-40",
          isActive && "bg-primary/10 font-bold text-primary shadow-2xs",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  }),
);
