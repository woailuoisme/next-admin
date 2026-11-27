import { useState } from "react";
import { useTranslations } from "next-intl";
import { LazyLocationMarkerMap } from "@/components/map/lazy";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { MOCK_DENSE_LOCATIONS } from "../constants";
import type { DemoStateProps } from "../types";

const BIG_DATA_MODES: readonly ("auto" | "dom" | "canvas")[] = ["auto", "dom", "canvas"];

export function BigDataShowcaseTab({ isLoading, isEmpty, isError, onRetry }: DemoStateProps) {
	const t = useTranslations("showcase");
	const [bigDataRenderMode, setBigDataRenderMode] = useState<"auto" | "dom" | "canvas">("auto");

	return (
		<TabsContent value="bigdata" className="flex flex-col gap-4">
			<div className="border-border/70 bg-card flex items-center justify-between rounded-lg border p-3 shadow-xs">
				<div className="flex flex-col gap-0.5">
					<div className="text-foreground text-xs font-semibold">{t("maps_bigdata_control_title")}</div>
					<div className="text-muted-foreground text-[11px]">{t("maps_bigdata_control_desc")}</div>
				</div>
				<div className="flex items-center gap-1.5">
					{BIG_DATA_MODES.map((mode) => (
						<Button
							key={mode}
							type="button"
							variant={bigDataRenderMode === mode ? "default" : "outline"}
							size="xs"
							aria-pressed={bigDataRenderMode === mode}
							className="text-xs uppercase"
							onClick={() => setBigDataRenderMode(mode)}
						>
							{mode}
						</Button>
					))}
				</div>
			</div>

			<LazyLocationMarkerMap
				locations={MOCK_DENSE_LOCATIONS}
				renderMode={bigDataRenderMode}
				tierThreshold={200}
				height={520}
				center={[121.47, 31.23]}
				zoom={11.5}
				showSearch={true}
				showCategoryFilter={true}
				showSidebarList={true}
				isLoading={isLoading}
				isEmpty={isEmpty}
				isError={isError}
				onRetry={onRetry}
				cardProps={{
					title: t("maps_bigdata_card_title"),
					description: t("maps_bigdata_card_desc"),
				}}
			/>
		</TabsContent>
	);
}
