import { User } from "lucide-react";
import { memo } from "react";

import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import type { AvatarThumbProps } from "./types";

import { getAvatarPalette, STATUS_DOT_CLASSES, STATUS_DOT_LABELS } from "./avatar-palette";

export const avatarSizeClasses = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-9 text-xs",
  lg: "size-10 text-sm",
};

export const avatarShapeClasses = {
  circle: "rounded-full after:rounded-full [&_img]:rounded-full [&_span]:rounded-full",
  rounded: "rounded-lg after:rounded-lg [&_img]:rounded-lg [&_span]:rounded-lg",
  square: "rounded-none after:rounded-none [&_img]:rounded-none [&_span]:rounded-none",
};

const mapSizeToAvatarProp = (size: "xs" | "sm" | "md" | "lg"): "default" | "sm" | "lg" => {
  if (size === "xs") return "sm";
  if (size === "lg") return "lg";
  return "default";
};

function AvatarThumbInner({
  src,
  name,
  fallback,
  size = "sm",
  shape = "circle",
  status,
  colorSeed,
  autoColor = true,
  className,
}: AvatarThumbProps) {
  const resolvedFallback =
    fallback ||
    (typeof name === "string" && name.trim().length > 0 ? name.trim().slice(0, 2).toUpperCase() : null);

  const seed =
    colorSeed ||
    (typeof name === "string" && name.trim().length > 0
      ? name.trim()
      : typeof fallback === "string" && fallback.trim().length > 0
        ? fallback.trim()
        : undefined);

  const palette = autoColor && seed ? getAvatarPalette(seed) : null;

  return (
    <Avatar
      size={mapSizeToAvatarProp(size)}
      className={cn(avatarSizeClasses[size], avatarShapeClasses[shape], "shrink-0", className)}
    >
      {src && <AvatarImage src={src} alt={typeof name === "string" ? name : "Avatar"} />}
      <AvatarFallback
        className={cn(
          "font-medium uppercase",
          palette
            ? `${palette.bg} ${palette.text} ${palette.border} border`
            : "bg-muted text-muted-foreground",
        )}
      >
        {resolvedFallback || <User className="size-3.5" />}
      </AvatarFallback>
      {status && (
        <AvatarBadge
          title={STATUS_DOT_LABELS[status]}
          className={cn(STATUS_DOT_CLASSES[status], shape !== "circle" && "rounded-full")}
        />
      )}
    </Avatar>
  );
}

export const AvatarThumb = memo(AvatarThumbInner);
