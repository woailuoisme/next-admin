import type React from "react";

import { RefreshCw, ZoomIn } from "lucide-react";
import { memo, useState } from "react";

import { cn } from "@/lib/utils";

export const sizeClasses = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-xs",
  lg: "size-14 text-sm",
  xl: "size-18 text-sm",
};

export const shapeClasses = {
  rounded: "rounded-md",
  square: "rounded-none",
  circle: "rounded-full",
};

export const aspectClasses = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-4/3",
  auto: "",
};

export const fitClasses = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
};

interface ImageThumbProps {
  imgUrl: string;
  idx: number;
  alt: string;
  width?: number | string;
  height?: number | string;
  size?: keyof typeof sizeClasses;
  shape?: keyof typeof shapeClasses;
  aspectRatio?: keyof typeof aspectClasses;
  objectFit?: keyof typeof fitClasses;
  preview?: boolean;
  isFailed: boolean;
  onError: () => void;
  onRetry?: () => void;
  onPreview: () => void;
}

function ImageThumbInner({
  imgUrl,
  idx,
  alt,
  width,
  height,
  size = "md",
  shape = "rounded",
  aspectRatio = "square",
  objectFit = "cover",
  preview = true,
  isFailed,
  onError,
  onRetry,
  onPreview,
}: ImageThumbProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const customStyle: React.CSSProperties = {
    ...(width ? { width: typeof width === "number" ? `${width}px` : width } : {}),
    ...(height ? { height: typeof height === "number" ? `${height}px` : height } : {}),
  };

  if (isFailed) {
    return (
      <button
        type="button"
        style={customStyle}
        onClick={(e) => {
          e.stopPropagation();
          onRetry?.();
        }}
        className={cn(
          "group/failed flex shrink-0 cursor-pointer items-center justify-center border border-dashed border-destructive/30 bg-destructive/5 text-destructive/70 transition-colors select-none hover:border-destructive/60 hover:bg-destructive/10",
          !width && !height && sizeClasses[size],
          shapeClasses[shape],
          aspectClasses[aspectRatio],
          idx > 0 && "-ml-2.5",
        )}
        title="图片加载失败，点击重试"
      >
        <RefreshCw className="size-3 transition-transform group-hover/failed:rotate-90" />
      </button>
    );
  }

  const imageElement = (
    <>
      {/* Shimmer skeleton before image is loaded */}
      {!isLoaded && <div className={cn("absolute inset-0 z-0 animate-pulse bg-muted/70", shapeClasses[shape])} />}
      <img
        src={imgUrl}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={onError}
        className={cn(
          "size-full transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          fitClasses[objectFit],
        )}
      />
    </>
  );

  if (preview) {
    return (
      <button
        type="button"
        style={customStyle}
        aria-label={`查看 ${alt} 大图`}
        onClick={(e) => {
          e.stopPropagation();
          onPreview();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onPreview();
          }
        }}
        className={cn(
          "group/img relative shrink-0 cursor-zoom-in overflow-hidden border border-border/80 bg-muted/30 p-0 text-left shadow-2xs transition-transform select-none hover:scale-105 hover:border-primary/50 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden",
          !width && !height && sizeClasses[size],
          shapeClasses[shape],
          aspectClasses[aspectRatio],
          idx > 0 && "-ml-2.5 hover:z-10",
        )}
      >
        {imageElement}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 transition-opacity group-hover/img:opacity-100">
          <ZoomIn className="size-3.5 drop-shadow-sm" />
        </div>
      </button>
    );
  }

  return (
    <div
      style={customStyle}
      className={cn(
        "group/img relative shrink-0 overflow-hidden border border-border/80 bg-muted/30 shadow-2xs select-none",
        !width && !height && sizeClasses[size],
        shapeClasses[shape],
        aspectClasses[aspectRatio],
        idx > 0 && "-ml-2.5",
      )}
    >
      {imageElement}
    </div>
  );
}

export const ImageThumb = memo(ImageThumbInner);
