"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useIsHydrated } from "@/hooks/useIsHydrated";
import { VerifyOtpForm } from "../components/VerifyOtpForm";
import { hasStoredResetFlow, readResetFlow } from "../resetFlow";

export function VerifyOtpPage() {
  const router = useRouter();
  const isMounted = useIsHydrated();
  const expired = isMounted ? hasStoredResetFlow() : false;
  const flow = isMounted ? readResetFlow() : null;

  useEffect(() => {
    if (!isMounted || flow) return;
    router.replace(expired ? "/forgot-password?expired=1" : "/forgot-password");
  }, [isMounted, flow, expired, router]);

  if (!flow) return null;

  return <VerifyOtpForm flow={flow} />;
}
