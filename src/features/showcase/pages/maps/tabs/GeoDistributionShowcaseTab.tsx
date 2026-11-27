import { useTranslations } from "next-intl";
import { LazyGeoDistributionMap } from "@/components/map/lazy";
import { TabsContent } from "@/components/ui/tabs";
import { MOCK_GEOJSON_DATA } from "../constants";
import type { DemoStateProps } from "../types";

export function GeoDistributionShowcaseTab({ isLoading, isEmpty, isError, onRetry }: DemoStateProps) {
	const t = useTranslations("showcase");
	return (
		<TabsContent value="geo" className="flex flex-col gap-4">
			<LazyGeoDistributionMap
				data={MOCK_GEOJSON_DATA}
				valueKey="value"
				labelKey="name"
				unit={t("maps_geo_unit")}
				colorScheme="primary"
				legendTitle={t("maps_geo_legend_title")}
				height={500}
				center={[114, 31]}
				zoom={4}
				isLoading={isLoading}
				isEmpty={isEmpty}
				isError={isError}
				onRetry={onRetry}
				cardProps={{
					title: t("maps_geo_card_title"),
					description: t("maps_geo_card_desc"),
				}}
			/>
		</TabsContent>
	);
}
