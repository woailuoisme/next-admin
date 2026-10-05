import { useMemoizedFn } from "ahooks";
import { Pipette } from "lucide-react";
import { memo, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { EyeDropperButtonProps, EyeDropperInstance } from "./types";

// SSR-safe detection of native EyeDropper API
function checkEyeDropperSupport(): boolean {
  return typeof window !== "undefined" && "EyeDropper" in window;
}

const emptySubscribe = () => () => {};

export const EyeDropperButton = memo(function EyeDropperButton({
  onSelect,
  disabled,
  className,
}: EyeDropperButtonProps) {
  const isSupported = useSyncExternalStore(emptySubscribe, checkEyeDropperSupport, () => false);

  const handlePickColor = useMemoizedFn(async () => {
    if (!checkEyeDropperSupport() || disabled || !window.EyeDropper) return;
    try {
      let eyeDropper: EyeDropperInstance | undefined;
      try {
        eyeDropper = new window.EyeDropper();
      } catch {
        const EyeDropperFn = window.EyeDropper as unknown as () => EyeDropperInstance;
        if (typeof EyeDropperFn === "function") {
          eyeDropper = EyeDropperFn();
        }
      }
      if (!eyeDropper || typeof eyeDropper.open !== "function") return;
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        onSelect(result.sRGBHex);
      }
    } catch (error) {
      // AbortError is thrown when user cancels selection via Escape or click-outside
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }
  });

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      disabled={disabled}
      onClick={handlePickColor}
      title="屏幕吸色器"
      aria-label="屏幕吸色器"
      className={cn("size-8 shrink-0 text-muted-foreground hover:text-foreground", className)}
    >
      <Pipette className="size-3.5" />
    </Button>
  );
});
