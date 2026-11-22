"use client";

import { CheckCircle2, Clock, DollarSign, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { StatsGrid } from "@/components/stats/grid/StatsGrid";
import type { SparklineLayout, StatDensity } from "@/components/stats/shared/types";
import { Sparkline } from "@/components/stats/sparkline/MiniSparkline";
import { StatCard } from "@/components/stats/stat-card/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { SPARKLINE_AREA_ITEMS, SPARKLINE_BAR_ITEMS } from "../constants";

type SparklineItem = (typeof SPARKLINE_AREA_ITEMS)[number];

function SparklineMatrix({
	title,
	label,
	type,
	items,
}: {
	title: string;
	label: string;
	type: "area" | "bar";
	items: readonly SparklineItem[];
}) {
	return (
		<div>
			<span className="text-muted-foreground mb-3 block text-xs font-semibold tracking-wider uppercase">{title}</span>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
				{items.map((item) => (
					<div
						key={item.theme}
						className="border-border/50 bg-card/60 flex flex-col justify-between space-y-2 rounded-xl border p-3"
					>
						<div className="flex items-center justify-between">
							<span className="text-foreground text-xs font-medium">{item.name}</span>
							<span className="text-muted-foreground font-mono text-[10px]">{label}</span>
						</div>
						<div className="h-10 w-full">
							<Sparkline data={item.data} theme={item.theme} type={type} className="h-full w-full" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export function CardsSparklineSection() {
	return (
		<>
			<div className="pt-6">
				<div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
					<div>
						<h2 className="text-foreground text-lg font-semibold">
							4. Standalone Micro-Charts (Zero-Dependency SVG Sparklines)
						</h2>
						<p className="text-muted-foreground text-xs">
							Ultra-lightweight Bezier smoothing with coordinate precision rounding and sub-millisecond render budget.
						</p>
					</div>
					<Badge variant="outline" className="w-fit font-mono text-[11px]">
						Sparkline Engine
					</Badge>
				</div>
			</div>

			<Card className="border-border/60">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-semibold">Semantic Theme Palettes & Style Matrix</CardTitle>
					<CardDescription className="text-xs">
						Embeddable inside tables, headers, dense KPI grids, or standalone micro-cards.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<SparklineMatrix title="Area Gradient Smoothing" label="Area" type="area" items={SPARKLINE_AREA_ITEMS} />
					<SparklineMatrix title="Categorical Bar Histograms" label="Bar" type="bar" items={SPARKLINE_BAR_ITEMS} />
				</CardContent>
			</Card>
		</>
	);
}

export function CardsDensitySection() {
	const [cardDensity, setCardDensity] = useState<StatDensity>("compact");
	const [cardSparklineLayout, setCardSparklineLayout] = useState<SparklineLayout>("inline");

	return (
		<>
			<div className="pt-6">
				<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
					<div>
						<h2 className="text-foreground text-lg font-semibold">
							5. Density Scaling & Anti-Truncation Sparkline Layouts
						</h2>
						<p className="text-muted-foreground text-xs">
							Interactive density control (compact, default, comfortable) and bottom-docked sparkline to guarantee 0
							text overflow in 4-column grids.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<div className="border-border/70 bg-muted/40 flex items-center rounded-lg border p-0.5">
							{(["compact", "default", "comfortable"] as const).map((d) => (
								<Button
									key={d}
									size="sm"
									variant={cardDensity === d ? "secondary" : "ghost"}
									className="h-7 text-xs capitalize"
									onClick={() => setCardDensity(d)}
								>
									{d}
								</Button>
							))}
						</div>
						<div className="border-border/70 bg-muted/40 flex items-center rounded-lg border p-0.5">
							{(["inline", "bottom"] as const).map((l) => (
								<Button
									key={l}
									size="sm"
									variant={cardSparklineLayout === l ? "secondary" : "ghost"}
									className="h-7 text-xs capitalize"
									onClick={() => setCardSparklineLayout(l)}
								>
									{l === "bottom" ? "Bottom Sparkline" : "Inline Sparkline"}
								</Button>
							))}
						</div>
					</div>
				</div>
			</div>

			<StatsGrid columns={4} density={cardDensity} sparklineLayout={cardSparklineLayout}>
				<StatCard
					title="平台有效订单总量"
					value="128,450"
					icon={ShoppingCart}
					theme="primary"
					trend={{ value: "+14.2%", direction: "up", label: "较上周同期" }}
					sparklineData={[20, 24, 28, 26, 32, 38, 42, 49, 58, 65]}
					description="全渠道支付成功的有效订单汇总"
				/>
				<StatCard
					title="待发货与履约中"
					value={342}
					icon={Clock}
					theme="chart-3"
					trend={{ value: "需加急", direction: "neutral", label: "待拣货出库" }}
					sparklineData={[12, 14, 18, 17, 21, 24, 25]}
					description="已分配到区域云仓的待拣选订单"
				/>
				<StatCard
					title="妥投履约达成率"
					value="98.6%"
					icon={CheckCircle2}
					theme="chart-2"
					trend={{ value: "98.6%", direction: "up", label: "SLA履约承诺达成率" }}
					sparklineData={[92, 94, 95, 96, 97, 98, 99]}
					description="48小时妥投承诺履约率"
				/>
				<StatCard
					title="平均客单价 (AOV)"
					value={86.5}
					prefix="$"
					icon={DollarSign}
					theme="chart-4"
					trend={{ value: "+8.4%", direction: "up", label: "较上季度平均" }}
					sparklineData={[68, 72, 70, 78, 82, 85, 86.5]}
					description="活跃客户每单平均结算金额"
				/>
			</StatsGrid>
		</>
	);
}
