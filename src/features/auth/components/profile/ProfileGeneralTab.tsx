"use client";

import { Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "cn";

import { Form, useAppForm } from "@/components/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/apiClient";

import { useUpdateProfileMutation } from "../../hooks";
import { buildProfileSchema } from "../../schemas";
import type { AdminRole, AdminUser } from "../../types";

const AVATAR_PRESETS = [
	"https://api.dicebear.com/9.x/initials/svg?seed=Admin",
	"https://api.dicebear.com/9.x/avataaars/svg?seed=Felix",
	"https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka",
	"https://api.dicebear.com/9.x/bottts-neutral/svg?seed=NextAdmin",
];

export interface ProfileGeneralTabProps {
	admin: AdminUser;
	roleLabels: Record<AdminRole, string>;
}

export function ProfileGeneralTab({ admin, roleLabels }: ProfileGeneralTabProps) {
	const t = useTranslations("profile");
	const tAuth = useTranslations("auth");
	const updateProfileMutation = useUpdateProfileMutation();

	const profileSchema = buildProfileSchema({
		nameRequired: t("name_required"),
		avatarInvalid: t("avatar_url_invalid"),
	});

	const profileForm = useAppForm({
		defaultValues: {
			name: admin.name,
			avatarUrl: admin.avatarUrl ?? "",
		},
		validators: {
			onSubmit: profileSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await updateProfileMutation.mutateAsync({
					name: value.name.trim(),
					avatarUrl: value.avatarUrl.trim(),
				});
				toast.success(t("profile_updated"));
			} catch (error) {
				toast.error(await getApiErrorMessage(error, tAuth("error_request_failed")));
			}
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">{t("general_title")}</CardTitle>
				<CardDescription>{t("general_desc")}</CardDescription>
			</CardHeader>
			<CardContent>
				<Form form={profileForm} className="flex flex-col gap-5">
					<profileForm.AppForm>
						<profileForm.AppField name="name">
							{(field) => <field.TextInput label={t("name_label")} placeholder={t("name_placeholder")} required />}
						</profileForm.AppField>

						<FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Field data-disabled>
								<FieldLabel htmlFor="profile-email">{t("email_label")}</FieldLabel>
								<Input id="profile-email" value={admin.email} disabled className="bg-muted/50" />
								<FieldDescription className="text-[11px]">{t("email_readonly_hint")}</FieldDescription>
							</Field>
							<Field data-disabled>
								<FieldLabel htmlFor="profile-role">{t("role_label")}</FieldLabel>
								<Input
									id="profile-role"
									value={roleLabels[admin.role] ?? admin.role}
									disabled
									className="bg-muted/50"
								/>
							</Field>
						</FieldGroup>

						<profileForm.AppField name="avatarUrl">
							{(field) => (
								<field.TextInput
									label={t("avatar_url_label")}
									placeholder={t("avatar_url_placeholder")}
									prefix={<Link2 className="text-muted-foreground size-4" aria-hidden="true" />}
									clearable
								/>
							)}
						</profileForm.AppField>
					</profileForm.AppForm>

					<profileForm.Subscribe selector={(state) => state.values.avatarUrl}>
						{(currentAvatarUrl) => (
							<div className="flex flex-col gap-1.5">
								<p className="text-muted-foreground text-xs">{t("avatar_presets_label")}</p>
								<div className="flex flex-wrap items-center gap-2.5">
									{AVATAR_PRESETS.map((presetUrl, index) => {
										const selected = currentAvatarUrl === presetUrl;
										const presetLabel = t("avatar_preset_aria", { index: index + 1 });
										return (
											<button
												key={presetUrl}
												type="button"
												aria-label={presetLabel}
												aria-pressed={selected}
												onClick={() => profileForm.setFieldValue("avatarUrl", presetUrl)}
												className={cn(
													"cursor-pointer rounded-full p-0.5 transition-all",
													selected ? "ring-primary ring-2 ring-offset-2" : "opacity-75 hover:opacity-100",
												)}
											>
												<Avatar className="size-9">
													<AvatarImage src={presetUrl} alt={presetLabel} />
													<AvatarFallback>A</AvatarFallback>
												</Avatar>
											</button>
										);
									})}
								</div>
							</div>
						)}
					</profileForm.Subscribe>

					<div className="flex justify-end pt-2">
						<Button type="submit" disabled={updateProfileMutation.isPending} className="cursor-pointer">
							{updateProfileMutation.isPending ? (
								<Spinner data-icon="inline-start" role={undefined} aria-hidden="true" />
							) : null}
							{updateProfileMutation.isPending ? t("saving_profile") : t("save_profile")}
						</Button>
					</div>
				</Form>
			</CardContent>
		</Card>
	);
}
