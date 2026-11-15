"use client";

import { forwardRef, memo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "cn";

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
      <Button
        ref={ref}
        type="button"
        variant={isActive ? "secondary" : "ghost"}
        size="icon-xs"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-pressed={Boolean(isActive)}
        title={label}
        className={cn(
          "size-7 text-xs",
          isActive && "bg-primary/10 font-bold text-primary shadow-2xs hover:bg-primary/15",
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }),
);
