"use client";

import { useMemoizedFn } from "ahooks";
import { ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OtpInput } from "@/components/form";
import type { MessageKeyOf } from "@/types/i18n";

import { resolveResetErrorKey, useForgotPasswordMutation, useVerifyOtpMutation } from "../hooks";
import type { ResetFlowState } from "../resetFlow";

import { AuthCard, AuthFormError, AuthSubmitButton } from "./AuthShell";

const RESEND_COOLDOWN_SECONDS = 60;

export interface VerifyOtpFormProps {
  flow: ResetFlowState;
}

export function VerifyOtpForm({ flow }: VerifyOtpFormProps) {
  const t = useTranslations("auth");
  const verifyMutation = useVerifyOtpMutation();
  const resendMutation = useForgotPasswordMutation();

  const [code, setCode] = useState("");
  const [errorKey, setErrorKey] = useState<MessageKeyOf<"auth"> | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const submitCode = useMemoizedFn(async (value: string) => {
    if (isLocked || value.length !== 6) return;
    setErrorKey(null);
    try {
      await verifyMutation.mutateAsync({ ticket: flow.ticket, code: value });
    } catch (error) {
      const key = await resolveResetErrorKey(error);
      setErrorKey(key ?? "error_request_failed");
      if (key === "error_too_many_attempts" || key === "error_ticket_expired") {
        setIsLocked(true);
      }
      setCode("");
    }
  });

  const handleResend = useMemoizedFn(async () => {
    if (cooldown > 0 || resendMutation.isPending) return;
    setErrorKey(null);
    setIsLocked(false);
    try {
      await resendMutation.mutateAsync({ email: flow.email });
      setCode("");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setErrorKey((await resolveResetErrorKey(error)) ?? "error_request_failed");
    }
  });

  const isSubmitting = verifyMutation.isPending;

  return (
    <AuthCard>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl font-bold tracking-tight">
          <ShieldCheck className="text-primary size-5" />
          {t("verify_card_title")}
        </CardTitle>
        <CardDescription className="text-xs">{t("verify_card_hint", { email: flow.email })}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <OtpInput
          label={t("otp_label")}
          value={code}
          onChange={setCode}
          onComplete={submitCode}
          length={6}
          separator={false}
          align="center"
          disabled={isSubmitting || isLocked}
          autoFocus
        />

        <p className="text-muted-foreground text-center text-[11px]">{t("code_sent_hint")}</p>

        {errorKey ? <AuthFormError message={t(errorKey)} className="justify-center" /> : null}

        <AuthSubmitButton
          type="button"
          isPending={isSubmitting}
          pendingLabel={t("verifying")}
          label={t("verify_action")}
          disabled={code.length !== 6 || isLocked}
          onClick={() => submitCode(code)}
        />

        <div className="flex flex-col items-center gap-2">
          {isLocked ? (
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
              <Link href="/forgot-password">
                <RefreshCw className="size-3.5" />
                {t("restart_flow")}
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              disabled={cooldown > 0 || resendMutation.isPending}
              onClick={handleResend}
            >
              <RefreshCw className={resendMutation.isPending ? "size-3.5 animate-spin" : "size-3.5"} />
              {cooldown > 0 ? t("resend_in", { seconds: cooldown }) : t("resend")}
            </Button>
          )}

          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            {t("back_to_login")}
          </Link>
        </div>
      </CardContent>
    </AuthCard>
  );
}
