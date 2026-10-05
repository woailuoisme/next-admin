import type { ReactNode } from "react";

import { HelpCircle } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LabelHelpTooltipProps {
  /** 帮助说明内容 */
  content: ReactNode;
}

/**
 * 字段/条目标签旁的帮助说明 tooltip（form / infolist 共用）
 */
export function LabelHelpTooltip({ content }: LabelHelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground/70 hover:text-foreground inline-flex cursor-help transition-colors"
          aria-label="查看字段帮助说明"
        >
          <HelpCircle className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
