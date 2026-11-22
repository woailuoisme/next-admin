import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import DashboardLoading from "@/app/(app)/loading";
import { ActionsShowcasePage } from "@/features/showcase/pages/actions/ActionsShowcasePage";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("showcase");
	return {
		title: t("actions_title"),
		description: t("actions_description"),
	};
}

export default function Page() {
	return (
		<Suspense fallback={<DashboardLoading />}>
			<ActionsShowcasePage />
		</Suspense>
	);
}
