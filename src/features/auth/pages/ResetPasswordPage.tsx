"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useIsHydrated } from "@/hooks/useIsHydrated";
import { ResetPasswordForm } from "../components/ResetPasswordForm";
import { hasStoredResetFlow, hasUsableResetToken, readResetFlow } from "../resetFlow";

export function ResetPasswordPage() {
  const router = useRouter();
  const isMounted = useIsHydrated();
  const expired = isMounted ? hasStoredResetFlow() : false;
  const flow = isMounted ? readResetFlow() : null;
  const usableFlow = isMounted && hasUsableResetToken(flow) ? flow : null;

  useEffect(() => {
    if (!isMounted || usableFlow) return;
    // 令牌缺失或过期都意味着要重新走一遍，直接回到第一步并说明原因
    router.replace(expired || flow ? "/forgot-password?expired=1" : "/forgot-password");
  }, [isMounted, usableFlow, expired, flow, router]);

  if (!usableFlow) return null;

  return <ResetPasswordForm resetToken={usableFlow.resetToken} email={usableFlow.email} />;
}
