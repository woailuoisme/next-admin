"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * 认证页统一外壳：全屏居中 + 两团主题色柔光背景。
 * 登录、忘记密码、验证码、重置密码共用，避免背景样式逐页复制漂移。
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="bg-primary/10 pointer-events-none absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      <div className="bg-primary/5 pointer-events-none absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full blur-3xl" />

      <div className="relative z-10 flex w-full flex-col items-center">{children}</div>
    </div>
  );
}

/** 认证表单统一卡片外观，四个认证页共用同一套描边、阴影与背景模糊 */
export function AuthCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      <Card className="border-border/60 shadow-xl backdrop-blur-sm">{children}</Card>
    </div>
  );
}

/** 表单级业务错误提示（成功/过期等提示请直接用 role="status"） */
export function AuthFormError({ message, className }: { message: ReactNode; className?: string }) {
  return (
    <p role="alert" className={cn("text-destructive flex items-center gap-1.5 text-xs", className)}>
      <AlertCircle className="size-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

/** 认证表单主按钮：统一的 pending 转圈与文案切换 */
export function AuthSubmitButton({
  isPending,
  label,
  pendingLabel,
  className,
  disabled,
  ...props
}: Omit<ComponentProps<typeof Button>, "children"> & {
  isPending: boolean;
  label: ReactNode;
  pendingLabel: ReactNode;
}) {
  return (
    <Button
      type="submit"
      className={cn("w-full font-semibold shadow-md", className)}
      {...props}
      disabled={isPending || disabled}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  );
}
