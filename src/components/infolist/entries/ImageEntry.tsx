import * as React from "react";

import { ImageLightboxModal } from "@/components/data-table";
import { cn } from "@/lib/utils";

import type { ImageEntryProps } from "./types";

import { EntryWrapper } from "../core/EntryWrapper";
import { useInfolistFieldValue } from "../core/InfolistContext";

const sizeClasses = {
  sm: "size-8",
  md: "size-12",
  lg: "size-16",
  xl: "size-24",
};

const shapeClasses = {
  circular: "rounded-full",
  rounded: "rounded-lg",
  square: "rounded-none",
};

export const ImageEntry = React.memo(function ImageEntry({
  name,
  value: explicitValue,
  alt = "Image",
  shape = "rounded",
  size = "md",
  lightbox = true,
  fallback,
  ...wrapperProps
}: ImageEntryProps) {
  const rawValue = useInfolistFieldValue(name, explicitValue);
  const [activeLightboxUrl, setActiveLightboxUrl] = React.useState<string | null>(null);

  const images: string[] = React.useMemo(() => {
    if (!rawValue) return [];
    if (Array.isArray(rawValue)) return rawValue.filter(Boolean);
    return [String(rawValue)];
  }, [rawValue]);

  if (images.length === 0) {
    return (
      <EntryWrapper {...wrapperProps}>
        {fallback ?? (
          <div
            className={cn(
              "flex items-center justify-center border border-dashed border-border bg-muted/60 text-xs text-muted-foreground/60 select-none",
              sizeClasses[size],
              shapeClasses[shape],
            )}
          >
            No img
          </div>
        )}
      </EntryWrapper>
    );
  }

  return (
    <EntryWrapper {...wrapperProps}>
      <div className="flex flex-wrap items-center gap-2">
        {images.map((url, idx) => (
          <button
            key={idx}
            type="button"
            disabled={!lightbox}
            onClick={() => lightbox && setActiveLightboxUrl(url)}
            className={cn(
              "group relative shrink-0 overflow-hidden border border-border bg-muted/20 transition-all",
              sizeClasses[size],
              shapeClasses[shape],
              lightbox ? "cursor-zoom-in hover:ring-2 hover:ring-primary/40" : "cursor-default",
            )}
          >
            <img
              src={url}
              alt={`${alt} ${idx + 1}`}
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {lightbox && (
        <ImageLightboxModal
          previewUrl={activeLightboxUrl}
          alt={alt}
          onClose={() => setActiveLightboxUrl(null)}
        />
      )}
    </EntryWrapper>
  );
});
