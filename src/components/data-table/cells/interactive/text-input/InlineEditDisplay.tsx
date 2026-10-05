import { Edit2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface InlineEditDisplayProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
  onStartEdit: () => void;
}

const alignClasses = {
  left: "justify-start text-left",
  center: "justify-center text-center",
  right: "justify-end text-right",
};

export function InlineEditDisplay({
  value,
  placeholder = "点击编辑...",
  disabled = false,
  loading = false,
  align = "left",
  className,
  onStartEdit,
}: InlineEditDisplayProps) {
  return (
    <div
      role={disabled ? undefined : "button"}
      tabIndex={disabled ? -1 : 0}
      aria-label={disabled ? undefined : `点击编辑: ${value || placeholder}`}
      className={cn(
        "group/cell -mx-1.5 flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-1 transition-colors select-none hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden",
        disabled && "cursor-default opacity-70",
        alignClasses[align],
        className,
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onStartEdit();
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          e.stopPropagation();
          onStartEdit();
        }
      }}
    >
      <span className={cn("truncate text-xs", !value && "text-muted-foreground/50 italic")}>
        {value || placeholder}
      </span>
      {loading ? (
        <Loader2 className="text-muted-foreground size-3 shrink-0 animate-spin" />
      ) : (
        !disabled && (
          <Edit2 className="text-muted-foreground/40 group-hover/cell:text-foreground/70 size-3 shrink-0 opacity-0 transition-colors group-hover/cell:opacity-100" />
        )
      )}
    </div>
  );
}
