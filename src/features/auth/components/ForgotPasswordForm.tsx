"use client";

import { useForm } from "@tanstack/react-form";
import { AlertCircle, ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Form, TextInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MessageKeyOf } from "@/types/i18n";

import { resolveResetErrorKey, useForgotPasswordMutation } from "../hooks";
import { forgotPasswordSchema } from "../schemas";

import { AuthCard } from "./AuthShell";

export interface ForgotPasswordFormProps {
  /** 从后续步骤因票据过期回退而来 */
  expired?: boolean;
}

export function ForgotPasswordForm({ expired = false }: ForgotPasswordFormProps) {
  const t = useTranslations("auth");
  const mutation = useForgotPasswordMutation();
  const [errorKey, setErrorKey] = useState<MessageKeyOf<"auth"> | null>(null);

  const form = useForm({
    defaultValues: { email: "" },
    validators: { onChange: forgotPasswordSchema, onSubmit: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      setErrorKey(null);
      try {
        await mutation.mutateAsync(value);
      } catch (error) {
        setErrorKey((await resolveResetErrorKey(error)) ?? "error_request_failed");
      }
    },
  });

  return (
    <AuthCard className="max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl font-bold tracking-tight">{t("forgot_card_title")}</CardTitle>
        <CardDescription className="text-xs">{t("forgot_card_hint")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {expired ? (
          <p
            className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-md px-3 py-2 text-xs"
            role="status"
          >
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{t("flow_expired_notice")}</span>
          </p>
        ) : null}

        <Form form={form} className="space-y-4">
          <TextInput
            name="email"
            label={t("email_label")}
            type="email"
            placeholder="admin@example.com"
            prefix={<Mail className="text-muted-foreground size-4" />}
            autoComplete="email"
            required
          />

          {errorKey ? (
            <p className="text-destructive flex items-center gap-1.5 text-xs" role="alert">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{t(errorKey)}</span>
            </p>
          ) : null}

          <Button type="submit" className="w-full font-semibold shadow-md" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("sending")}
              </>
            ) : (
              t("send_code")
            )}
          </Button>
        </Form>

        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 text-xs transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          {t("back_to_login")}
        </Link>
      </CardContent>
    </AuthCard>
  );
}
