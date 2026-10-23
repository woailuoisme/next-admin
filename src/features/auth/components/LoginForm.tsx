"use client";

import { useForm } from "@tanstack/react-form";
import { useMemoizedFn } from "ahooks";
import { KeyRound, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Form, TextInput } from "@/components/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useDemoAccountsQuery, useLoginMutation } from "../hooks";
import { loginSchema } from "../schemas";

import { AuthCard } from "./AuthShell";

const DEMO_SKELETON_KEYS = ["demo-sk-1", "demo-sk-2", "demo-sk-3"];

const DEFAULT_EMAIL = "admin@example.com";

export interface LoginFormProps {
  /** 密码重置成功回跳时预填的邮箱 */
  initialEmail?: string;
}

export function LoginForm({ initialEmail }: LoginFormProps = {}) {
  const loginMutation = useLoginMutation();
  const { data: demoAccounts, isLoading: isDemoLoading } = useDemoAccountsQuery();
  const [selectedEmail, setSelectedEmail] = useState(initialEmail ?? DEFAULT_EMAIL);

  const form = useForm({
    defaultValues: { email: initialEmail ?? DEFAULT_EMAIL, password: "admin123" },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync(value);
    },
  });

  const handleQuickSelect = useMemoizedFn((email: string) => {
    setSelectedEmail(email);
    form.setFieldValue("email", email);
    form.setFieldValue("password", "admin123");
  });

  const t = useTranslations("auth");

  return (
    <AuthCard>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">{t("portal_title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form form={form} className="space-y-4">
          <TextInput
            name="email"
            label={t("email_label")}
            type="email"
            placeholder="admin@example.com"
            prefix={<Mail className="text-muted-foreground size-4" />}
            required
          />

          <TextInput
            name="password"
            label={t("password_label")}
            password
            placeholder="••••••••"
            prefix={<Lock className="text-muted-foreground size-4" />}
            hint={t("password_hint")}
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

          <Button type="submit" className="mt-2 w-full font-semibold shadow-md" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </Form>
      </CardContent>
      <CardFooter className="border-border/40 bg-muted/20 flex flex-col border-t p-4">
        <div className="w-full space-y-2">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <KeyRound className="size-3.5" />
            <span>{t("demo_accounts")}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {isDemoLoading
              ? DEMO_SKELETON_KEYS.map((key) => <Skeleton key={key} className="h-14 rounded-lg" />)
              : demoAccounts?.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickSelect(acc.email)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all",
                      selectedEmail === acc.email
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-border/60 hover:border-border hover:bg-muted/50",
                    )}
                  >
                    <span className="text-xs leading-none font-semibold">{acc.name.split(" ")[0]}</span>
                    <Badge variant="outline" className="mt-1 scale-90 px-1 py-0 text-[10px]">
                      {acc.role}
                    </Badge>
                  </button>
                ))}
          </div>
        </div>
      </CardFooter>
    </AuthCard>
  );
}
