import { useMemoizedFn } from "ahooks";
import { FileText, ImageIcon, Package, User } from "lucide-react";
import { memo, useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { ImageCellProps, ImagePlaceholderType } from "./types";

import { TEXT_ALIGN_CLASSES } from "../../base";
import { ImageLightboxModal } from "./ImageLightboxModal";
import { aspectClasses, ImageThumb, shapeClasses, sizeClasses } from "./ImageThumb";

const EMPTY_IMAGES: string[] = [];

function renderEmptyPlaceholderIcon(type?: ImagePlaceholderType) {
  switch (type) {
    case "product":
      return <Package className="size-4 opacity-60" />;
    case "document":
      return <FileText className="size-4 opacity-60" />;
    case "avatar":
      return <User className="size-4 opacity-60" />;
    case "generic":
    default:
      return <ImageIcon className="size-4 opacity-60" />;
  }
}

function ImageCellInner({
  src,
  alt = "图片预览",
  width,
  height,
  size = "md",
  shape = "rounded",
  aspectRatio = "square",
  objectFit = "cover",
  preview = true,
  maxStacked = 3,
  placeholderType = "generic",
  gallery = true,
  fallback,
  tooltip,
  align = "left",
  className,
}: ImageCellProps) {
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Normalize src to an array of URLs
  const images = Array.isArray(src) ? src.filter(Boolean) : src ? [src] : EMPTY_IMAGES;

  const handleImageError = useMemoizedFn((imgSrc: string) => {
    setFailedImages((prev) => ({ ...prev, [imgSrc]: true }));
  });

  const handleImageRetry = useMemoizedFn((imgSrc: string) => {
    setFailedImages((prev) => {
      const updated = { ...prev };
      delete updated[imgSrc];
      return updated;
    });
  });

  const handleClosePreview = useMemoizedFn(() => {
    setActivePreviewUrl(null);
  });

  // Fallback empty view when no images provided
  if (images.length === 0) {
    return (
      <div className={cn("flex items-center text-muted-foreground/40", TEXT_ALIGN_CLASSES[align], className)}>
        {fallback || (
          <div
            className={cn(
              "flex items-center justify-center border border-dashed border-border/80 bg-muted/40 text-muted-foreground/60 transition-colors",
              !width && !height && sizeClasses[size],
              shapeClasses[shape],
              aspectClasses[aspectRatio],
            )}
          >
            {renderEmptyPlaceholderIcon(placeholderType)}
          </div>
        )}
      </div>
    );
  }

  const visibleImages = images.slice(0, maxStacked);
  const remainingCount = images.length - maxStacked;

  const content = (
    <div className={cn("flex items-center gap-1.5", TEXT_ALIGN_CLASSES[align], className)}>
      <div className="flex items-center">
        {visibleImages.map((url, idx) => (
          <ImageThumb
            key={url + idx}
            imgUrl={url}
            idx={idx}
            alt={alt}
            width={width}
            height={height}
            size={size}
            shape={shape}
            aspectRatio={aspectRatio}
            objectFit={objectFit}
            preview={preview}
            isFailed={Boolean(failedImages[url])}
            onError={() => handleImageError(url)}
            onRetry={() => handleImageRetry(url)}
            onPreview={() => setActivePreviewUrl(url)}
          />
        ))}
        {remainingCount > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (preview) {
                setActivePreviewUrl(images[maxStacked]);
              }
            }}
            className={cn(
              "z-10 -ml-2.5 flex items-center justify-center rounded-full border border-border bg-muted/90 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-xs select-none",
              preview && "cursor-pointer transition-transform hover:scale-105 hover:bg-muted",
            )}
            title={`全部 ${images.length} 张图片`}
          >
            +{remainingCount}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex max-w-full">{content}</div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      ) : (
        content
      )}

      {/* Lightbox Dialog Preview */}
      {preview && (
        <ImageLightboxModal
          previewUrl={activePreviewUrl}
          images={gallery ? images : undefined}
          alt={alt}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
}

export const ImageCell = memo(ImageCellInner);
