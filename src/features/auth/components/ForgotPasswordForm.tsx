"use client";

import { AlertCircle, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Form, useAppForm } from "@/components/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MessageKeyOf } from "@/types/i18n";

import { resolveResetErrorKey, useForgotPasswordMutation } from "../hooks";
import { forgotPasswordSchema } from "../schemas";

import { AuthCard, AuthFormError, AuthSubmitButton } from "./AuthShell";

export interface ForgotPasswordFormProps {
	/** 从后续步骤因票据过期回退而来 */
	expired?: boolean;
}

export function ForgotPasswordForm({ expired = false }: ForgotPasswordFormProps) {
	const t = useTranslations("auth");
	const mutation = useForgotPasswordMutation();
	const [errorKey, setErrorKey] = useState<MessageKeyOf<"auth"> | null>(null);

	const form = useAppForm({
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
			<CardHeader className="flex flex-col gap-1 text-center">
				<CardTitle className="text-xl font-bold tracking-tight">{t("forgot_card_title")}</CardTitle>
				<CardDescription className="text-xs">{t("forgot_card_hint")}</CardDescription>
			</CardHeader>

			<CardContent className="flex flex-col gap-4">
				{expired ? (
					<Alert role="status" className="bg-muted text-muted-foreground">
						<AlertCircle aria-hidden="true" />
						<AlertDescription className="text-xs">{t("flow_expired_notice")}</AlertDescription>
					</Alert>
				) : null}

				<Form form={form} className="flex flex-col gap-4">
					<form.AppForm>
						<form.AppField name="email">
							{(field) => (
								<field.TextInput
									label={t("email_label")}
									type="email"
									placeholder="name@company.com"
									prefix={<Mail className="text-muted-foreground size-4" />}
									autoComplete="email"
									required
								/>
							)}
						</form.AppField>
					</form.AppForm>

					{errorKey ? <AuthFormError message={t(errorKey)} /> : null}

					<AuthSubmitButton isPending={mutation.isPending} pendingLabel={t("sending")} label={t("send_code")} />
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
