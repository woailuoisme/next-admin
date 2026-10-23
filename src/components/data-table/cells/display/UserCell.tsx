import { useMemoizedFn } from "ahooks";
import { isNil } from "es-toolkit";
import { BadgeCheck, Check, Copy, User } from "lucide-react";
import { memo, useState } from "react";

import { cn } from "@/lib/utils";

import type { UserCellProps } from "./types";

import { AVATAR_ALIGN_CLASSES } from "../base";
import { avatarShapeClasses, avatarSizeClasses, AvatarThumb } from "../media/avatar/AvatarThumb";

export const UserCell = memo(function UserCell({
  name,
  subtitle,
  avatarSrc,
  avatarUrl,
  fallback,
  avatarFallback,
  shape = "circle",
  size = "sm",
  status,
  autoColor = true,
  verified = false,
  copyableSubtitle = false,
  allowUnassigned = true,
  unassignedText = "未指派",
  badge,
  align = "left",
  onClick,
  className,
}: UserCellProps) {
  const [copied, setCopied] = useState(false);

  const isExplicitUnassigned =
    allowUnassigned && (isNil(name) || name === "" || name === "未指派" || name === "Unassigned" || name === "待分配");

  const hasNoInfo = isNil(name) && isNil(subtitle);

  const handleCopySubtitle = useMemoizedFn((e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof subtitle === "string") {
      navigator.clipboard.writeText(subtitle);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  });

  // 1. Unassigned State
  if (isExplicitUnassigned || (allowUnassigned && hasNoInfo)) {
    return (
      <div
        className={cn(
          "group/user-cell flex max-w-full min-w-0 items-center gap-2.5 select-none",
          AVATAR_ALIGN_CLASSES[align],
          onClick && "cursor-pointer hover:opacity-85",
          className,
        )}
        onClick={onClick}
        data-testid="user-cell-unassigned"
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-center border border-dashed border-muted-foreground/30 bg-muted/20 text-muted-foreground/50",
            avatarSizeClasses[size],
            avatarShapeClasses[shape],
          )}
        >
          <User className="size-3.5 opacity-60" />
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="text-muted-foreground/60 truncate text-xs italic">{unassignedText}</span>
          {subtitle && <span className="text-muted-foreground/50 mt-0.5 truncate text-[11px]">{subtitle}</span>}
        </div>
      </div>
    );
  }

  if (hasNoInfo) {
    return <span className="text-muted-foreground/40 text-xs italic">-</span>;
  }

  const resolvedSrc = avatarSrc || avatarUrl;
  const resolvedFallback = avatarFallback || fallback;

  return (
    <div
      className={cn(
        "group/user-cell flex max-w-full min-w-0 items-center gap-2.5",
        AVATAR_ALIGN_CLASSES[align],
        onClick && "cursor-pointer hover:opacity-85",
        className,
      )}
      onClick={onClick}
      data-testid="user-cell"
    >
      <AvatarThumb
        src={resolvedSrc}
        name={name}
        fallback={resolvedFallback}
        size={size}
        shape={shape}
        status={status}
        autoColor={autoColor}
      />

      <div className="flex min-w-0 flex-col leading-tight">
        <div className="flex min-w-0 items-center gap-1.5">
          {name && (
            <span
              className={cn(
                "truncate text-xs font-medium tracking-tight text-foreground",
                onClick && "group-hover/user-cell:underline",
              )}
            >
              {name}
            </span>
          )}
          {verified && <BadgeCheck className="text-primary size-3.5 shrink-0" aria-label="已官方认证" />}
          {badge}
        </div>
        {subtitle && (
          <div className="group/sub mt-0.5 flex min-w-0 items-center gap-1">
            <span className="text-muted-foreground/80 truncate text-[11px]">{subtitle}</span>
            {copyableSubtitle && typeof subtitle === "string" && (
              <button
                type="button"
                onClick={handleCopySubtitle}
                className="text-muted-foreground/50 hover:bg-muted hover:text-foreground cursor-pointer rounded p-0.5 opacity-0 transition-opacity group-hover/user-cell:opacity-100"
                title="复制副文本"
                aria-label="复制"
              >
                {copied ? <Check className="size-2.5 text-emerald-500" /> : <Copy className="size-2.5" />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
