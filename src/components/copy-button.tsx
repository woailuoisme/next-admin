import { useBoolean } from "ahooks";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  title?: string;
  successMessage?: string;
}

export function CopyButton({
  text,
  className,
  title = "Copy to clipboard",
  successMessage = "Copied to clipboard!",
}: CopyButtonProps) {
  const [copied, { setTrue: setCopiedTrue, setFalse: setCopiedFalse }] = useBoolean(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTrue();
      toast.success(successMessage);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopiedFalse();
      }, 1500);
    } catch (err) {
      console.error("Failed to copy text", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "size-6 cursor-pointer p-0 text-muted-foreground transition-colors hover:text-foreground",
            className,
          )}
          onClick={handleCopy}
          aria-label={title}
        >
          {copied ? (
            <Check className="animate-in text-primary zoom-in size-3 duration-200" />
          ) : (
            <Copy className="size-3 transition-transform duration-150 hover:scale-110" />
          )}
          <span className="sr-only">{title}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="px-2 py-1 text-[11px]">
        {copied ? "Copied!" : title}
      </TooltipContent>
    </Tooltip>
  );
}
