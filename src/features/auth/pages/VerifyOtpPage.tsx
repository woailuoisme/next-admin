"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { VerifyOtpForm } from "../components/VerifyOtpForm";
import { hasStoredResetFlow, readResetFlow } from "../resetFlow";

export function VerifyOtpPage() {
  const router = useRouter();
  const [state] = useState(() => {
    const hadStoredFlow = hasStoredResetFlow();
    return { flow: readResetFlow(), expired: hadStoredFlow };
  });

  useEffect(() => {
    if (state.flow) return;
    router.replace(state.expired ? "/forgot-password?expired=1" : "/forgot-password");
  }, [state, router]);

  if (!state.flow) return null;

  return <VerifyOtpForm flow={state.flow} />;
}
