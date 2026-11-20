"use client";

import { Lock, Palette, User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProfileGeneralTab } from "../components/profile/ProfileGeneralTab";
import { ProfileIdentityCard } from "../components/profile/ProfileIdentityCard";
import { ProfilePreferencesTab } from "../components/profile/ProfilePreferencesTab";
import { ProfileSecurityTab } from "../components/profile/ProfileSecurityTab";
import { useAuthAdmin } from "../store";
import type { AdminRole } from "../types";

type ProfileTab = "general" | "security" | "preferences";

function resolveTabParam(value: string | null): ProfileTab {
  if (value === "security" || value === "preferences") return value;
  return "general";
}

export function ProfilePage() {
  const t = useTranslations("profile");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const admin = useAuthAdmin();
  const urlTabParam = searchParams.get("tab");
  const [localTabState, setLocalTabState] = useState<{ urlTab: string | null; tab: ProfileTab } | null>(null);
  const activeTab =
    localTabState && localTabState.urlTab === urlTabParam ? localTabState.tab : resolveTabParam(urlTabParam);

  const handleTabChange = (nextTab: ProfileTab) => {
    setLocalTabState({ urlTab: urlTabParam, tab: nextTab });
    const params = new URLSearchParams(searchParams.toString());
    if (nextTab === "general") {
      params.delete("tab");
    } else {
      params.set("tab", nextTab);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  if (!admin) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-4">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="size-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-44" />
                </div>
              </div>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-8">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const roleLabels: Record<AdminRole, string> = {
    superadmin: t("role_superadmin"),
    admin: t("role_admin"),
    manager: t("role_manager"),
    auditor: t("role_auditor"),
    operator: t("role_operator"),
    viewer: t("role_viewer"),
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{t("page_title")}</h1>
        <p className="text-muted-foreground text-sm">{t("page_subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <ProfileIdentityCard
            admin={admin}
            roleLabels={roleLabels}
            onJumpToSecurity={() => handleTabChange("security")}
          />
        </div>

        <div className="lg:col-span-8">
          <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as ProfileTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general" className="gap-1.5">
                <UserIcon className="size-3.5" />
                {t("tab_general")}
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5">
                <Lock className="size-3.5" />
                {t("tab_security")}
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-1.5">
                <Palette className="size-3.5" />
                {t("tab_preferences")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4">
              <ProfileGeneralTab key={admin.id} admin={admin} roleLabels={roleLabels} />
            </TabsContent>

            <TabsContent value="security" className="mt-4">
              <ProfileSecurityTab admin={admin} />
            </TabsContent>

            <TabsContent value="preferences" className="mt-4">
              <ProfilePreferencesTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
