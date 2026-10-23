import { useTranslations } from "next-intl";
import { memo, type ReactNode } from "react";

import { HelpCircle } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface LabelHelpTooltipProps {
  /** 帮助说明内容 */
  content: ReactNode;
  /** 可选国际化字典覆盖 */

  /** 可选离散 aria-label 覆盖 */
  helpTooltipAria?: string;
}

/**
 * 字段/条目标签旁的帮助说明 tooltip（form / infolist 共用）
 */
export const LabelHelpTooltip = memo(function LabelHelpTooltip({ content, helpTooltipAria }: LabelHelpTooltipProps) {
  const t = useTranslations("shared");
  const resolvedAria = helpTooltipAria ?? t("help_tooltip_aria");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground/70 hover:text-foreground inline-flex cursor-help transition-colors"
          aria-label={resolvedAria}
        >
          <HelpCircle className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  );
});
