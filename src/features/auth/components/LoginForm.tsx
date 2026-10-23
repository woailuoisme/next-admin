"use client";

import { useForm } from "@tanstack/react-form";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Form, TextInput } from "@/components/form";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useLoginMutation } from "../hooks";
import { loginSchema } from "../schemas";

import { AuthCard, AuthSubmitButton } from "./AuthShell";

export interface LoginFormProps {
  /** 密码重置成功回跳时预填的邮箱 */
  initialEmail?: string;
}

export function LoginForm({ initialEmail }: LoginFormProps = {}) {
  const loginMutation = useLoginMutation();
  const t = useTranslations("auth");

  const form = useForm({
    defaultValues: { email: initialEmail ?? "", password: "" },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await loginMutation.mutateAsync(value);
      } catch {
        // 错误已由 useLoginMutation 的 onError 拦截并通过 toast 统一展示
      }
    },
  });

  return (
    <AuthCard>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">{t("portal_title")}</CardTitle>
        <CardDescription className="text-muted-foreground text-xs">{t("portal_description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form form={form} className="space-y-4">
          <TextInput
            name="email"
            label={t("email_label")}
            type="email"
            placeholder="name@company.com"
            prefix={<Mail className="text-muted-foreground size-4" />}
            autoComplete="email"
            required
          />

          <TextInput
            name="password"
            label={t("password_label")}
            password
            placeholder="••••••••"
            prefix={<Lock className="text-muted-foreground size-4" />}
            autoComplete="current-password"
            required
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              {t("forgot_link")}
            </Link>
          </div>

          <AuthSubmitButton
            className="mt-2"
            isPending={loginMutation.isPending}
            pendingLabel={t("submitting")}
            label={t("submit")}
          />
        </Form>
      </CardContent>
    </AuthCard>
  );
}
