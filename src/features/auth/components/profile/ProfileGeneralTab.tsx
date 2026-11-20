"use client";

import { useForm } from "@tanstack/react-form";
import { Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "cn";

import { TextInput } from "@/components/form/basic";
import { Form } from "@/components/form/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const profileForm = useForm({
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
        <Form form={profileForm} className="space-y-5">
          <TextInput name="name" label={t("name_label")} placeholder={t("name_placeholder")} required />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-email">{t("email_label")}</Label>
              <Input id="profile-email" value={admin.email} disabled className="bg-muted/50" />
              <p className="text-muted-foreground text-[11px]">{t("email_readonly_hint")}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-role">{t("role_label")}</Label>
              <Input id="profile-role" value={roleLabels[admin.role] ?? admin.role} disabled className="bg-muted/50" />
            </div>
          </div>

          <TextInput
            name="avatarUrl"
            label={t("avatar_url_label")}
            placeholder={t("avatar_url_placeholder")}
            prefix={<Link2 className="text-muted-foreground size-4" />}
            clearable
          />

          <profileForm.Subscribe selector={(state) => state.values.avatarUrl}>
            {(currentAvatarUrl) => (
              <div className="space-y-1.5">
                <p className="text-muted-foreground text-xs">{t("avatar_presets_label")}</p>
                <div className="flex flex-wrap items-center gap-2.5">
                  {AVATAR_PRESETS.map((presetUrl) => {
                    const selected = currentAvatarUrl === presetUrl;
                    return (
                      <button
                        key={presetUrl}
                        type="button"
                        onClick={() => profileForm.setFieldValue("avatarUrl", presetUrl)}
                        className={cn(
                          "cursor-pointer rounded-full p-0.5 transition-all",
                          selected ? "ring-primary ring-2 ring-offset-2" : "opacity-75 hover:opacity-100",
                        )}
                      >
                        <Avatar className="size-9">
                          <AvatarImage src={presetUrl} alt="Preset avatar" />
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
              {updateProfileMutation.isPending ? t("saving_profile") : t("save_profile")}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
