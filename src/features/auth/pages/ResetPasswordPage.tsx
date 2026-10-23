"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ResetPasswordForm } from "../components/ResetPasswordForm";
import { hasStoredResetFlow, hasUsableResetToken, readResetFlow } from "../resetFlow";

export function ResetPasswordPage() {
  const router = useRouter();
  const [state] = useState(() => {
    const hadStoredFlow = hasStoredResetFlow();
    const flow = readResetFlow();
    return { flow, usableFlow: hasUsableResetToken(flow) ? flow : null, expired: hadStoredFlow };
  });

  useEffect(() => {
    if (state.usableFlow) return;
    // 令牌缺失或过期都意味着要重新走一遍，直接回到第一步并说明原因
    router.replace(state.expired || state.flow ? "/forgot-password?expired=1" : "/forgot-password");
  }, [state, router]);

  if (!state.usableFlow) return null;

  return <ResetPasswordForm resetToken={state.usableFlow.resetToken} email={state.usableFlow.email} />;
}
