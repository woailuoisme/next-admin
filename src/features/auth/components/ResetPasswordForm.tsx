"use client";

import { KeyRound, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Form, useAppForm } from "@/components/form";
import { PasswordStrengthMeter } from "@/components/form/security/PasswordStrengthMeter";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MessageKeyOf } from "@/types/i18n";

import { resolveResetErrorKey, useResetPasswordMutation } from "../hooks";
import { buildResetPasswordSchema } from "../schemas";

import { AuthCard, AuthFormError, AuthSubmitButton, usePasswordRequirements } from "./AuthShell";

export interface ResetPasswordFormProps {
	resetToken: string;
	email: string;
}

export function ResetPasswordForm({ resetToken, email }: ResetPasswordFormProps) {
	const t = useTranslations("auth");
	const mutation = useResetPasswordMutation();
	const [errorKey, setErrorKey] = useState<MessageKeyOf<"auth"> | null>(null);
	const requirements = usePasswordRequirements();

	const schema = buildResetPasswordSchema({
		tooShort: t("error_password_weak"),
		tooWeak: t("error_password_weak"),
		sameAsEmail: t("error_password_same_as_email"),
		mismatch: t("error_password_mismatch"),
	});

	const form = useAppForm({
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
			<CardHeader className="flex flex-col gap-1 text-center">
				<CardTitle className="flex items-center justify-center gap-2 text-xl font-bold tracking-tight">
					<KeyRound className="text-primary size-5" aria-hidden="true" />
					{t("reset_card_title")}
				</CardTitle>
				<CardDescription className="text-xs">{t("reset_card_hint")}</CardDescription>
			</CardHeader>

			<CardContent className="flex flex-col gap-4">
				<Form form={form} className="flex flex-col gap-4">
					<form.AppForm>
						<form.AppField name="password">
							{(field) => (
								<field.TextInput
									label={t("new_password_label")}
									password
									placeholder="••••••••"
									prefix={<Lock className="text-muted-foreground size-4" />}
									autoComplete="new-password"
									required
								/>
							)}
						</form.AppField>

						<form.Subscribe selector={(state) => state.values.password}>
							{(password) => (
								<PasswordStrengthMeter
									password={password}
									requirements={requirements}
									showScoreLabel
									showRequirements
								/>
							)}
						</form.Subscribe>

						<form.AppField name="confirmPassword">
							{(field) => (
								<field.TextInput
									label={t("confirm_password_label")}
									password
									placeholder="••••••••"
									prefix={<Lock className="text-muted-foreground size-4" />}
									autoComplete="new-password"
									required
								/>
							)}
						</form.AppField>
					</form.AppForm>

					{errorKey ? <AuthFormError message={t(errorKey)} /> : null}

					<AuthSubmitButton isPending={mutation.isPending} pendingLabel={t("resetting")} label={t("reset_action")} />
				</Form>
			</CardContent>
		</AuthCard>
	);
}
