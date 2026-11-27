"use client";

import { Activity, Cpu, HardDrive, type LucideIcon, Zap } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import type { TelemetryMetricPoint } from "../types";

function KpiCard({
	title,
	icon: Icon,
	value,
	children,
}: {
	title: string;
	icon: LucideIcon;
	value: string | number;
	children: ReactNode;
}) {
	return (
		<Card className="bg-card border-border shadow-xs">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-muted-foreground text-xs font-medium">{title}</CardTitle>
				<Icon className="text-primary size-4" aria-hidden="true" />
			</CardHeader>
			<CardContent>
				<div className="text-foreground font-mono text-2xl font-bold">{value}</div>
				{children}
			</CardContent>
		</Card>
	);
}

export function TelemetryKpiCards({ currentPoint }: { currentPoint: TelemetryMetricPoint }) {
	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<KpiCard title="实时请求吞吐 (QPS)" icon={Activity} value={currentPoint.qps.toLocaleString()}>
				<p className="text-muted-foreground mt-1 text-[11px]">峰值: {(currentPoint.qps * 1.25).toFixed(0)} req/s</p>
			</KpiCard>

			<KpiCard title="事务提交速率 (TPS)" icon={Zap} value={currentPoint.tps.toLocaleString()}>
				<p className="text-muted-foreground mt-1 text-[11px]">成功率: 99.98%</p>
			</KpiCard>

			<KpiCard title="CPU 核心负载" icon={Cpu} value={`${currentPoint.cpu}%`}>
				<Progress value={currentPoint.cpu} className="mt-2 h-1.5" />
			</KpiCard>

			<KpiCard title="内存占用 / Sockets" icon={HardDrive} value={`${currentPoint.memory}%`}>
				<p className="text-muted-foreground mt-1 text-[11px]">{currentPoint.activeSockets} 活跃长连接</p>
			</KpiCard>
		</div>
	);
}
