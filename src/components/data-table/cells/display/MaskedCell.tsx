import { isNil } from "es-toolkit";
import { Eye, EyeOff } from "lucide-react";
import { memo, useEffect, useState } from "react";

import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { MaskedCellProps, MaskType } from "./types";

import { TEXT_ALIGN_CLASSES } from "../base";

export function formatMaskedValue(
  val: string,
  type: MaskType = "custom",
  customMask?: (v: string) => string,
): string {
  if (!val) return "";
  if (customMask) return customMask(val);

  switch (type) {
    case "phone": {
      const clean = val.replace(/\s+/g, "");
      if (clean.length === 11) {
        return clean.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
      }
      if (clean.length > 6) {
        return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
      }
      return "******";
    }
    case "email": {
      const [user, domain] = val.split("@");
      if (!domain) return "******";
      if (user.length <= 2) {
        return `${user[0]}*@${domain}`;
      }
      const visiblePrefix = user.slice(0, 2);
      const visibleSuffix = user.slice(-1);
      return `${visiblePrefix}****${visibleSuffix}@${domain}`;
    }
    case "apiKey": {
      if (val.length <= 8) return "••••••••";
      const prefix = val.includes("_") ? val.split("_")[0] + "_" : val.slice(0, 4);
      const suffix = val.slice(-4);
      return `${prefix}••••••••${suffix}`;
    }
    case "idCard": {
      if (val.length === 18) {
        return val.replace(/^(\d{6})\d{8}(\d{3}[\dXx])$/, "$1********$2");
      }
      if (val.length > 8) {
        return `${val.slice(0, 4)}********${val.slice(-4)}`;
      }
      return "********";
    }
    case "creditCard": {
      const clean = val.replace(/[\s-]+/g, "");
      if (clean.length >= 12) {
        return `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}`;
      }
      return "**** **** **** ****";
    }
    case "jwt": {
      const parts = val.split(".");
      if (parts.length === 3) {
        return `${parts[0].slice(0, 6)}...••••••••...${parts[2].slice(-6)}`;
      }
      if (val.length > 16) {
        return `${val.slice(0, 6)}••••••••${val.slice(-6)}`;
      }
      return "••••••••";
    }
    default: {
      if (val.length <= 4) return "••••";
      return `${val.slice(0, 2)}••••••••${val.slice(-2)}`;
    }
  }
}

export const MaskedCell = memo(function MaskedCell({
  value,
  maskType = "custom",
  customMask,
  allowReveal = true,
  autoHideDuration,
  copyable = true,
  allowCopy,
  mono = true,
  align = "left",
  className,
}: MaskedCellProps) {
  const [revealed, setRevealed] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const isCopyable = allowCopy ?? copyable;

  // 处理自动遮蔽倒计时
  useEffect(() => {
    if (!revealed || !autoHideDuration || autoHideDuration <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setRevealed(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [revealed, autoHideDuration]);

  if (isNil(value) || value === "") {
    return <span className="text-muted-foreground/40 text-xs italic">-</span>;
  }

  const stringVal = String(value);
  const displayedText = revealed ? stringVal : formatMaskedValue(stringVal, maskType, customMask);

  const handleToggleReveal = () => {
    setRevealed((prev) => {
      const next = !prev;
      setRemainingSeconds(next && autoHideDuration && autoHideDuration > 0 ? autoHideDuration : 0);
      return next;
    });
  };

  return (
    <div
      className={cn(
        "group/masked-cell flex items-center gap-1.5 text-xs tracking-tight",
        mono && "font-mono",
        TEXT_ALIGN_CLASSES[align],
        className,
      )}
      data-testid="masked-cell"
    >
      <span className={cn("select-all", !revealed && "text-muted-foreground")}>{displayedText}</span>

      <div className="flex items-center gap-1 opacity-60 transition-opacity group-hover/masked-cell:opacity-100">
        {allowReveal && (
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-6 w-6"
              onClick={handleToggleReveal}
              aria-label={revealed ? "隐藏数据" : "查看明文"}
              title={revealed ? "隐藏数据" : "查看明文"}
            >
              {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </Button>

            {revealed && autoHideDuration && remainingSeconds > 0 && (
              <span
                className="bg-muted text-muted-foreground rounded-xs px-1 font-mono text-[9px]"
                title={`将在 ${remainingSeconds} 秒后自动隐藏`}
              >
                {remainingSeconds}s
              </span>
            )}
          </div>
        )}

        {isCopyable && (
          <CopyButton
            text={stringVal}
            className="text-muted-foreground hover:text-foreground h-6 w-6"
            title="复制真实值"
          />
        )}
      </div>
    </div>
  );
});
