import { Activity, Bug } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { isGlitchTipEnabled, triggerTestError } from "@/integrations/glitchtip";
import { cn } from "@/lib/utils";

function handleTest() {
  const res = triggerTestError();
  if (res.success) {
    toast.success(res.message);
  } else {
    toast.error(res.message);
  }
}

export function GlitchTipDiagnostic() {
  const isEnabled = isGlitchTipEnabled();

  return (
    <div className="border-border/40 space-y-1.5 border-t pt-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium">
          <Activity className="text-primary size-3" />
          异常监控 (GlitchTip)
        </span>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[9px] font-semibold",
            isEnabled
              ? "border border-primary/20 bg-primary/10 text-primary"
              : "border border-muted bg-muted text-muted-foreground",
          )}
        >
          {isEnabled ? "已连接" : "未配置 DSN"}
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
        触发测试异常 (Test Error)
      </Button>
    </div>
  );
}
