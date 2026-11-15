import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ImageLightboxModalProps {
  previewUrl: string | null;
  images?: string[];
  initialIndex?: number;
  alt: string;
  onClose: () => void;
}

function ImageLightboxModalInner({ previewUrl, images = [], initialIndex = 0, alt, onClose }: ImageLightboxModalProps) {
  // Active images list for gallery navigation
  const activeImages = images.length > 0 ? images : previewUrl ? [previewUrl] : [];

  const resolvedInitialIndex = useMemo(() => {
    if (previewUrl && images.length > 0) {
      const foundIdx = images.indexOf(previewUrl);
      return foundIdx >= 0 ? foundIdx : initialIndex;
    }
    return initialIndex;
  }, [previewUrl, images, initialIndex]);

  const [navState, setNavState] = useState<{ baseUrl: string | null; index: number } | null>(null);
  const currentIndex = navState && navState.baseUrl === previewUrl ? navState.index : resolvedInitialIndex;

  const stepIndex = useCallback(
    (delta: number) => {
      if (activeImages.length === 0) return;
      setNavState((prev) => {
        const base = prev && prev.baseUrl === previewUrl ? prev.index : resolvedInitialIndex;
        const next = (base + delta + activeImages.length) % activeImages.length;
        return { baseUrl: previewUrl, index: next };
      });
    },
    [activeImages.length, previewUrl, resolvedInitialIndex],
  );

  const currentUrl = activeImages[currentIndex] || previewUrl;
  const hasMultiple = activeImages.length > 1;

  // Keyboard arrow navigation
  useEffect(() => {
    if (!previewUrl || !hasMultiple) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepIndex(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepIndex(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewUrl, hasMultiple, stepIndex]);

  return (
    <Dialog open={Boolean(previewUrl)} onOpenChange={(open) => !open && onClose()}>
      {/* 补 `sm:max-w-3xl`：DialogContent 基础含 `sm:max-w-sm`，裸 `max-w-3xl` 不在同一
			    合并组内会被它击败 → ≥640px 时灯箱被压到 24rem，大图无法正常查看。 */}
      <DialogContent className="border-border bg-background/95 max-w-3xl overflow-hidden p-3 backdrop-blur-md sm:max-w-3xl">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        {currentUrl && (
          <div className="relative flex max-h-[82vh] flex-col items-center justify-center overflow-hidden rounded-lg">
            <div className="relative flex max-h-[75vh] w-full items-center justify-center">
              <img
                src={currentUrl}
                alt={`${alt} (${currentIndex + 1}/${activeImages.length})`}
                className="max-h-[72vh] w-auto max-w-full rounded object-contain shadow-md"
              />

              {/* Gallery Navigation Controls */}
              {hasMultiple && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="上一张图片"
                    className="bg-background/60 text-foreground hover:bg-background/90 absolute top-1/2 left-2 -translate-y-1/2 rounded-full backdrop-blur-xs"
                    onClick={() => stepIndex(-1)}
                  >
                    <ChevronLeft className="size-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="下一张图片"
                    className="bg-background/60 text-foreground hover:bg-background/90 absolute top-1/2 right-2 -translate-y-1/2 rounded-full backdrop-blur-xs"
                    onClick={() => stepIndex(1)}
                  >
                    <ChevronRight className="size-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Footer with Alt & Counter */}
            <div className="text-muted-foreground mt-2.5 flex w-full items-center justify-between px-2 text-xs">
              <p className="truncate font-medium">{alt}</p>
              {hasMultiple && (
                <span className="border-border/60 bg-muted/60 rounded-md border px-2 py-0.5 font-mono text-[11px]">
                  {currentIndex + 1} / {activeImages.length}
                </span>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const ImageLightboxModal = memo(ImageLightboxModalInner);
