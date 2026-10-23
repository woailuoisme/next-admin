"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ForgotPasswordForm } from "../components/ForgotPasswordForm";
import { readResetFlow } from "../resetFlow";

export function ForgotPasswordPage({ expired = false }: { expired?: boolean }) {
  const router = useRouter();

  // 已经拿到有效票据的用户直接回到验证步骤，避免重复发送验证码
  useEffect(() => {
    if (readResetFlow()) router.replace("/forgot-password/verify");
  }, [router]);

  return <ForgotPasswordForm expired={expired} />;
}
