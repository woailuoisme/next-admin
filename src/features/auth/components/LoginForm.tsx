"use client";

import { useForm } from "@tanstack/react-form";
import { useMemoizedFn } from "ahooks";
import { KeyRound, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";

import { Form, TextInput } from "@/components/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useDemoAccountsQuery, useLoginMutation } from "../hooks";
import { loginSchema } from "../schemas";

const DEMO_SKELETON_KEYS = ["demo-sk-1", "demo-sk-2", "demo-sk-3"];

const DEFAULT_LOGIN_VALUES = {
  email: "admin@example.com",
  password: "admin123",
};

export function LoginForm() {
  const loginMutation = useLoginMutation();
  const { data: demoAccounts, isLoading: isDemoLoading } = useDemoAccountsQuery();
  const [selectedEmail, setSelectedEmail] = useState("admin@example.com");

  const form = useForm({
    defaultValues: DEFAULT_LOGIN_VALUES,
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

  return (
    <div className="w-full max-w-md space-y-6">
      <Card className="border-border/60 shadow-xl backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Admin Portal</CardTitle>
        </CardHeader>
        <CardContent>
          <Form form={form} className="space-y-4">
            <TextInput
              name="email"
              label="Staff Email"
              type="email"
              placeholder="admin@example.com"
              prefix={<Mail className="text-muted-foreground size-4" />}
              required
            />

            <TextInput
              name="password"
              label="Password"
              password
              placeholder="••••••••"
              prefix={<Lock className="text-muted-foreground size-4" />}
              hint="Default: admin123"
              required
            />

            <Button
              type="submit"
              className="mt-2 w-full font-semibold shadow-md"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </Button>
          </Form>
        </CardContent>
        <CardFooter className="border-border/40 bg-muted/20 flex flex-col border-t p-4">
          <div className="w-full space-y-2">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <KeyRound className="size-3.5" />
              <span>Quick Demo Accounts (1-Click Fill):</span>
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
      </Card>
    </div>
  );
}
