"use client";

import { Lock, Palette, User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProfileGeneralTab } from "../components/profile/ProfileGeneralTab";
import { ProfileIdentityCard } from "../components/profile/ProfileIdentityCard";
import { ProfilePreferencesTab } from "../components/profile/ProfilePreferencesTab";
import { ProfileSecurityTab } from "../components/profile/ProfileSecurityTab";
import { ProfileSkeleton } from "../components/profile/ProfileSkeleton";
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
		return <ProfileSkeleton />;
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
			<div className="flex flex-col gap-1">
				<h1 className="text-foreground text-2xl font-semibold tracking-tight">{t("page_title")}</h1>
				<p className="text-muted-foreground text-sm">{t("page_subtitle")}</p>
			</div>

			<div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
				<div className="flex flex-col gap-6 lg:col-span-4">
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
								<UserIcon className="size-3.5" aria-hidden="true" />
								{t("tab_general")}
							</TabsTrigger>
							<TabsTrigger value="security" className="gap-1.5">
								<Lock className="size-3.5" aria-hidden="true" />
								{t("tab_security")}
							</TabsTrigger>
							<TabsTrigger value="preferences" className="gap-1.5">
								<Palette className="size-3.5" aria-hidden="true" />
								{t("tab_preferences")}
							</TabsTrigger>
						</TabsList>

						<TabsContent value="general" className="mt-4">
							<ProfileGeneralTab
								key={`${admin.id}:${admin.name}:${admin.avatarUrl ?? ""}`}
								admin={admin}
								roleLabels={roleLabels}
							/>
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
