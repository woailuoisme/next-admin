import { useTranslations } from "next-intl";
import { MapPin, Navigation, Network, PieChart } from "lucide-react";

import { Card } from "@/components/ui/card";

const MAP_HIGHLIGHTS = [
	{ icon: MapPin, key: "markers" },
	{ icon: Navigation, key: "route" },
	{ icon: PieChart, key: "geo" },
	{ icon: Network, key: "arc" },
] as const;

export function MapFeatureHighlights() {
	const t = useTranslations("showcase");

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{MAP_HIGHLIGHTS.map(({ icon: Icon, key }) => (
				<Card key={key} className="border-border/60 bg-muted/20 flex items-center gap-3 p-3.5">
					<div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
						<Icon className="size-4" />
					</div>
					<div className="text-xs">
						<div className="text-foreground font-semibold">{t(`maps_highlight_${key}_title`)}</div>
						<div className="text-muted-foreground">{t(`maps_highlight_${key}_desc`)}</div>
					</div>
				</Card>
			))}
		</div>
	);
}
