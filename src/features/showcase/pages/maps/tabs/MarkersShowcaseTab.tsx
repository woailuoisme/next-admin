import { useTranslations } from "next-intl";
import { LazyLocationMarkerMap } from "@/components/map/lazy";
import { TabsContent } from "@/components/ui/tabs";
import { MOCK_LOCATIONS } from "../constants";
import type { DemoStateProps } from "../types";

export function MarkersShowcaseTab({ isLoading, isEmpty, isError, onRetry }: DemoStateProps) {
	const t = useTranslations("showcase");
	return (
		<TabsContent value="markers" className="space-y-4">
			<LazyLocationMarkerMap
				locations={MOCK_LOCATIONS}
				height={520}
				center={[114, 30]}
				zoom={4.5}
				showSearch={true}
				showCategoryFilter={true}
				showSidebarList={true}
				isLoading={isLoading}
				isEmpty={isEmpty}
				isError={isError}
				onRetry={onRetry}
				cardProps={{
					title: t("maps_markers_card_title"),
					description: t("maps_markers_card_desc"),
				}}
			/>
		</TabsContent>
	);
}
