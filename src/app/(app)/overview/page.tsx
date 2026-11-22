import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import "@/lib/serverAuthHeaders";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { DashboardContainer } from "@/features/dashboard/pages/DashboardContainer";
import { dashboardResource } from "@/features/dashboard/resource";
import { dashboardTimeRangeSchema } from "@/features/dashboard/schemas";
import type { DashboardTimeRange } from "@/features/dashboard/types";
import { getQueryClient, prefetchWithTimeout } from "@/lib/queryClient";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("common");
	return { title: t("overview_title"), description: t("overview_description") };
}

export default async function Page(props: { searchParams: Promise<{ range?: string }> }) {
	const { range: rawRange } = await props.searchParams;
	const parsedRange = dashboardTimeRangeSchema.safeParse(rawRange);
	const range: DashboardTimeRange = parsedRange.success ? parsedRange.data : "30d";
	const queryClient = getQueryClient();

	await prefetchWithTimeout(queryClient.prefetchQuery(dashboardResource.queries.summary(range)));

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<DashboardSkeleton />}>
				<DashboardContainer />
			</Suspense>
		</HydrationBoundary>
	);
}
