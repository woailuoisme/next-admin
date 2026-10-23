"use client";

import { useForm } from "@tanstack/react-form";
import { KeyRound, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { DEFAULT_PASSWORD_REQUIREMENTS, Form, PasswordStrengthMeter, TextInput } from "@/components/form";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MessageKeyOf } from "@/types/i18n";

import { resolveResetErrorKey, useResetPasswordMutation } from "../hooks";
import { buildResetPasswordSchema } from "../schemas";

import { AuthCard, AuthFormError, AuthSubmitButton } from "./AuthShell";

// 与 DEFAULT_PASSWORD_REQUIREMENTS 的顺序一一对应，仅替换文案
const REQUIREMENT_LABEL_KEYS = [
  "password_req_length",
  "password_req_case",
  "password_req_number",
  "password_req_symbol",
] as const;

export interface ResetPasswordFormProps {
  resetToken: string;
  email: string;
}

export function ResetPasswordForm({ resetToken, email }: ResetPasswordFormProps) {
  const t = useTranslations("auth");
  const tForm = useTranslations("form");
  const mutation = useResetPasswordMutation();
  const [errorKey, setErrorKey] = useState<MessageKeyOf<"auth"> | null>(null);
  const [passwordValue, setPasswordValue] = useState("");

  const requirements = useMemo(
    () =>
      DEFAULT_PASSWORD_REQUIREMENTS.map((requirement, index) => ({
        ...requirement,
        label: tForm(REQUIREMENT_LABEL_KEYS[index]),
      })),
    [tForm],
  );

  const schema = useMemo(
    () =>
      buildResetPasswordSchema({
        tooShort: t("error_password_weak"),
        tooWeak: t("error_password_weak"),
        sameAsEmail: t("error_password_same_as_email"),
        mismatch: t("error_password_mismatch"),
      }),
    [t],
  );

  const form = useForm({
    defaultValues: { email, password: "", confirmPassword: "" },
    validators: { onChange: schema, onSubmit: schema },
    onSubmit: async ({ value }) => {
      setErrorKey(null);
      try {
        await mutation.mutateAsync({ resetToken, password: value.password });
      } catch (error) {
        setErrorKey((await resolveResetErrorKey(error)) ?? "error_request_failed");
      }
    },
  });

  return (
    <AuthCard>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl font-bold tracking-tight">
          <KeyRound className="text-primary size-5" />
          {t("reset_card_title")}
        </CardTitle>
        <CardDescription className="text-xs">{t("reset_card_hint")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Form form={form} className="space-y-4">
          <TextInput
            name="password"
            label={t("new_password_label")}
            password
            placeholder="••••••••"
            prefix={<Lock className="text-muted-foreground size-4" />}
            autoComplete="new-password"
            onChange={(value) => setPasswordValue(String(value))}
            required
          />

          <PasswordStrengthMeter password={passwordValue} requirements={requirements} showScoreLabel showRequirements />

          <TextInput
            name="confirmPassword"
            label={t("confirm_password_label")}
            password
            placeholder="••••••••"
            prefix={<Lock className="text-muted-foreground size-4" />}
            autoComplete="new-password"
            required
          />

          {errorKey ? <AuthFormError message={t(errorKey)} /> : null}

          <AuthSubmitButton isPending={mutation.isPending} pendingLabel={t("resetting")} label={t("reset_action")} />
        </Form>
      </CardContent>
    </AuthCard>
  );
}
