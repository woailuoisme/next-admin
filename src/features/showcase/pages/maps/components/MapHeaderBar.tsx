import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DemoState } from "../types";

interface MapHeaderBarProps {
	demoState: DemoState;
	onDemoStateChange: (state: DemoState) => void;
	onReset: () => void;
}

const DEMO_STATES = ["normal", "loading", "empty", "error"] as const satisfies readonly DemoState[];

export function MapHeaderBar({ demoState, onDemoStateChange, onReset }: MapHeaderBarProps) {
	const t = useTranslations("showcase");
	const stateLabels = {
		normal: t("maps_state_normal"),
		loading: t("maps_state_loading"),
		empty: t("maps_state_empty"),
		error: t("maps_state_error"),
	} as const;

	return (
		<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div>
				<div className="flex items-center gap-2">
					<h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">{t("maps_header_title")}</h1>
					<Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
						{t("maps_header_badge")}
					</Badge>
				</div>
				<p className="text-muted-foreground mt-1 text-sm">{t("maps_header_desc")}</p>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<div className="border-border bg-card flex items-center rounded-lg border p-0.5 text-xs">
					{DEMO_STATES.map((st) => (
						<Button
							key={st}
							type="button"
							variant={demoState === st ? "default" : "ghost"}
							size="xs"
							aria-pressed={demoState === st}
							className="px-2.5"
							onClick={() => onDemoStateChange(st)}
						>
							{stateLabels[st]}
						</Button>
					))}
				</div>

				<Button type="button" variant="outline" size="sm" className="text-xs" onClick={onReset}>
					<RefreshCw data-icon="inline-start" aria-hidden="true" />
					{t("maps_state_reset")}
				</Button>
			</div>
		</div>
	);
}
