import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { FormLocationPicker } from "@/components/form/map";
import type { LocationPickerValue } from "@/components/map/picker/types";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { DEMO_CITY_PRESETS } from "@/features/showcase/pages/forms/constants";

export function PickerShowcaseTab() {
	const t = useTranslations("showcase");
	const [formPickerVal, setFormPickerVal] = useState<LocationPickerValue>({
		lng: 116.4074,
		lat: 39.9042,
		address: "Beijing City Center",
	});

	return (
		<TabsContent value="picker" className="space-y-4">
			<Card className="p-6">
				<div className="mb-4">
					<h3 className="text-foreground text-base font-semibold">{t("maps_picker_title")}</h3>
					<p className="text-muted-foreground text-xs">{t("maps_picker_desc")}</p>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<FormLocationPicker
							label={t("maps_picker_label")}
							helperText={t("maps_picker_helper")}
							value={formPickerVal}
							onChange={setFormPickerVal}
							height={380}
							zoom={11}
							showCoordinatesInput={true}
							showReset={true}
							showAddressSearch={true}
							showCopyButton={true}
							quickPresets={DEMO_CITY_PRESETS}
						/>
					</div>

					<div className="border-border bg-muted/20 flex flex-col justify-between rounded-lg border p-4">
						<div>
							<h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
								{t("maps_picker_mirror_title")}
							</h4>
							<div className="mt-3 space-y-2.5">
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">{t("maps_picker_lng")}</span>
									<span className="text-primary font-mono font-semibold">{formPickerVal.lng.toFixed(6)}</span>
								</div>
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">{t("maps_picker_lat")}</span>
									<span className="text-primary font-mono font-semibold">{formPickerVal.lat.toFixed(6)}</span>
								</div>
								{formPickerVal.address && (
									<div className="flex items-center justify-between text-xs">
										<span className="text-muted-foreground">{t("maps_picker_address")}</span>
										<span className="text-foreground max-w-44 truncate text-right">{formPickerVal.address}</span>
									</div>
								)}
							</div>
						</div>

						<div className="border-primary/20 bg-primary/10 text-primary mt-4 rounded-md border p-2.5 text-xs">
							<div className="flex items-center gap-1.5 font-semibold">
								<Sparkles className="size-3.5" />
								<span>{t("maps_picker_design_title")}</span>
							</div>
							<p className="text-muted-foreground mt-1 text-[11px]">{t("maps_picker_design_desc")}</p>
						</div>
					</div>
				</div>
			</Card>
		</TabsContent>
	);
}
