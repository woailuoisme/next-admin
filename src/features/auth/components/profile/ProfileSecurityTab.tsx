"use client";

import { KeyRound, Laptop, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Form, useAppForm } from "@/components/form";
import { PasswordStrengthMeter } from "@/components/form/security/PasswordStrengthMeter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/apiClient";

import { useChangePasswordMutation } from "../../hooks";
import { buildChangePasswordSchema } from "../../schemas";
import type { AdminUser } from "../../types";
import { AuthFormError, useFormatShortDate, usePasswordRequirements } from "../AuthShell";

export interface ProfileSecurityTabProps {
	admin: AdminUser;
}

export function ProfileSecurityTab({ admin }: ProfileSecurityTabProps) {
	const t = useTranslations("profile");
	const tAuth = useTranslations("auth");
	const formatDate = useFormatShortDate();
	const passwordRequirements = usePasswordRequirements();
	const changePasswordMutation = useChangePasswordMutation();
	const [passwordError, setPasswordError] = useState<string | null>(null);

	const changePasswordSchema = buildChangePasswordSchema(
		{
			currentRequired: t("current_password_required"),
			tooShort: tAuth("error_password_weak"),
			tooWeak: tAuth("error_password_weak"),
			sameAsEmail: tAuth("error_password_same_as_email"),
			mismatch: tAuth("error_password_mismatch"),
		},
		admin.email,
	);

	const passwordForm = useAppForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		validators: {
			onSubmit: changePasswordSchema,
		},
		onSubmit: async ({ value }) => {
			setPasswordError(null);
			try {
				await changePasswordMutation.mutateAsync({
					currentPassword: value.currentPassword,
					newPassword: value.newPassword,
				});
				passwordForm.reset();
				toast.success(t("password_updated"));
			} catch (error) {
				setPasswordError(await getApiErrorMessage(error, tAuth("error_request_failed")));
			}
		},
	});

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<KeyRound className="size-4" aria-hidden="true" />
						{t("security_title")}
					</CardTitle>
					<CardDescription>{t("security_desc")}</CardDescription>
				</CardHeader>
				<CardContent>
					<Form form={passwordForm} className="flex flex-col gap-4">
						{passwordError ? <AuthFormError message={passwordError} /> : null}

						<passwordForm.AppForm>
							<passwordForm.AppField name="currentPassword">
								{(field) => (
									<field.TextInput
										label={t("current_password_label")}
										password
										placeholder={t("current_password_placeholder")}
										prefix={<Lock className="text-muted-foreground size-4" aria-hidden="true" />}
										autoComplete="current-password"
										required
									/>
								)}
							</passwordForm.AppField>

							<passwordForm.AppField name="newPassword">
								{(field) => (
									<field.TextInput
										label={t("new_password_label")}
										password
										placeholder={t("new_password_placeholder")}
										prefix={<Lock className="text-muted-foreground size-4" aria-hidden="true" />}
										autoComplete="new-password"
										required
									/>
								)}
							</passwordForm.AppField>

							<passwordForm.Subscribe selector={(state) => state.values.newPassword}>
								{(newPassword) => <PasswordStrengthMeter password={newPassword} requirements={passwordRequirements} />}
							</passwordForm.Subscribe>

							<passwordForm.AppField name="confirmPassword">
								{(field) => (
									<field.TextInput
										label={t("confirm_password_label")}
										password
										placeholder={t("confirm_password_placeholder")}
										prefix={<Lock className="text-muted-foreground size-4" aria-hidden="true" />}
										autoComplete="new-password"
										required
									/>
								)}
							</passwordForm.AppField>
						</passwordForm.AppForm>

						<div className="flex justify-end pt-2">
							<Button type="submit" disabled={changePasswordMutation.isPending} className="cursor-pointer">
								{changePasswordMutation.isPending ? (
									<Spinner data-icon="inline-start" role={undefined} aria-hidden="true" />
								) : null}
								{changePasswordMutation.isPending ? t("updating_password") : t("update_password")}
							</Button>
						</div>
					</Form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">{t("sessions_title")}</CardTitle>
					<CardDescription>{t("sessions_desc")}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="border-border flex items-center justify-between rounded-lg border p-3.5">
						<div className="flex items-center gap-3">
							<div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
								<Laptop className="size-4" aria-hidden="true" />
							</div>
							<div className="flex flex-col gap-0.5">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium">{t("session_browser")}</span>
									<Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
										{t("session_current_badge")}
									</Badge>
								</div>
								<p className="text-muted-foreground text-xs">
									{t("session_location")} · {formatDate(admin.lastActiveAt)}
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
