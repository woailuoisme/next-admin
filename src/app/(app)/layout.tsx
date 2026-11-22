import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AppDashboardShell } from "./_components/AppDashboardShell";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("common");
	return { title: t("app_title"), description: t("app_description") };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <AppDashboardShell>{children}</AppDashboardShell>;
}
