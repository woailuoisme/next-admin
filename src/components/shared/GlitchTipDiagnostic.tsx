"use client";

import { useTranslations } from "next-intl";

import { Activity, Bug } from "lucide-react";
import { memo } from "react";
import { toast } from "sonner";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { isGlitchTipEnabled, triggerTestError } from "@/integrations/glitchtip";

export interface GlitchTipDiagnosticProps {
  className?: string;

  title?: string;
  triggerText?: string;
}

function handleTest() {
  const res = triggerTestError();
  if (res.success) {
    toast.success(res.message);
  } else {
    toast.error(res.message);
  }
}

export const GlitchTipDiagnostic = memo(function GlitchTipDiagnostic({
  className,
  title,
  triggerText,
}: GlitchTipDiagnosticProps) {
  const t = useTranslations("shared");
  const isEnabled = isGlitchTipEnabled();

  const titleText = title ?? t("glitchtip_title");
  const triggerBtnText = triggerText ?? t("glitchtip_test_btn");
  const statusText = isEnabled ? t("glitchtip_connected") : t("glitchtip_unconfigured");

  return (
    <div className={cn("border-border/40 space-y-1.5 border-t pt-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium">
          <Activity className="text-primary size-3" />
          {titleText}
        </span>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[9px] font-semibold",
            isEnabled
              ? "border border-primary/20 bg-primary/10 text-primary"
              : "border border-muted bg-muted text-muted-foreground",
          )}
        >
          {statusText}
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleTest}
        disabled={!isEnabled}
        className="h-7 w-full cursor-pointer text-xs"
      >
        <Bug className="mr-1.5 size-3.5" />
        {triggerBtnText}
      </Button>
    </div>
  );
});
