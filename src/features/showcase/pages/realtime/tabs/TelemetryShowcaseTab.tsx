"use client";

import { useMutation } from "@tanstack/react-query";
import { useInterval } from "ahooks";
import { Radio, Send } from "lucide-react";
import { useFormatter } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { LazyAreaTrendChart } from "@/components/chart/lazy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { useCentrifuge, useSubscription } from "@/integrations/centrifuge";

import { publishRealtime } from "../api";
import { TelemetryKpiCards } from "../components/TelemetryKpiCards";
import { INITIAL_TELEMETRY_POINTS } from "../constants";
import type { TelemetryMetricPoint } from "../types";

export function TelemetryShowcaseTab() {
	const format = useFormatter();
	const { isConnected } = useCentrifuge();
	const [metrics, setMetrics] = useState<TelemetryMetricPoint[]>(INITIAL_TELEMETRY_POINTS);
	const [isAutoStreaming, setIsAutoStreaming] = useState(false);
	const [streamInterval, setStreamInterval] = useState("2000");
	const [lastMessageOffset, setLastMessageOffset] = useState<number | null>(null);

	const currentPoint = metrics[metrics.length - 1] ?? INITIAL_TELEMETRY_POINTS[0];

	const formatTelemetryTime = (date: Date) =>
		format.dateTime(date, { hour: "2-digit", minute: "2-digit", second: "2-digit" });

	const handleTelemetryPublication = (pub: { data: Partial<TelemetryMetricPoint>; offset?: number }) => {
		const now = new Date();
		const incoming = pub.data;
		if (pub.offset !== undefined) setLastMessageOffset(pub.offset);

		setMetrics((prev) => [
			...prev.slice(-24),
			{
				time: formatTelemetryTime(now),
				timestamp: now.getTime(),
				qps: incoming.qps ?? Math.floor(1900 + Math.random() * 700),
				tps: incoming.tps ?? Math.floor(480 + Math.random() * 200),
				cpu: incoming.cpu ?? Math.floor(35 + Math.random() * 20),
				memory: incoming.memory ?? Math.floor(48 + Math.random() * 8),
				activeSockets: incoming.activeSockets ?? 1080 + Math.floor(Math.random() * 40),
			},
		]);
	};

	useSubscription<Partial<TelemetryMetricPoint>>("public:telemetry", handleTelemetryPublication);

	const { mutate: publishPulse, isPending: isSendingPulse } = useMutation({
		mutationFn: async (payload: Partial<TelemetryMetricPoint>) => {
			const res = await publishRealtime("public:telemetry", payload);
			if (!res.ok) throw new Error("PUBLISH_FAILED");
			return (await res.json()) as { result?: { offset?: number } };
		},
		onSuccess: (json) => {
			if (json?.result?.offset !== undefined) setLastMessageOffset(json.result.offset);
		},
		onError: (e) => {
			toast.error(
				e instanceof Error && e.message === "PUBLISH_FAILED"
					? "遥测脉冲发送失败，请检查容器状态"
					: "网络异常，无法发送遥测脉冲",
			);
		},
	});

	const sendTelemetryPulse = () => {
		const now = new Date();
		publishPulse({
			qps: Math.floor(2800 + Math.random() * 800),
			tps: Math.floor(750 + Math.random() * 300),
			cpu: Math.floor(55 + Math.random() * 25),
			memory: Math.floor(52 + Math.random() * 10),
			activeSockets: 1150 + Math.floor(Math.random() * 80),
			time: formatTelemetryTime(now),
			timestamp: now.getTime(),
		});
	};

	useInterval(
		sendTelemetryPulse,
		isAutoStreaming && isConnected ? Number.parseInt(streamInterval, 10) || 2000 : undefined,
	);

	const chartData = metrics.map((m) => ({ label: m.time, value: m.qps, secondaryValue: m.tps }));

	return (
		<TabsContent value="telemetry" className="flex flex-col gap-6">
			<Card className="bg-card border-border shadow-xs">
				<CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
							<Radio className="size-5 animate-pulse" aria-hidden="true" />
						</div>
						<div>
							<h3 className="text-foreground text-sm font-semibold">频道: public:telemetry</h3>
							<p className="text-muted-foreground text-xs">
								实时接收高频 QPS/TPS 指标脉冲流
								{lastMessageOffset !== null ? ` · 当前 Offset: #${lastMessageOffset}` : null}
							</p>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<div className="flex items-center gap-2">
							<Switch
								id="auto-stream"
								checked={isAutoStreaming}
								onCheckedChange={setIsAutoStreaming}
								disabled={!isConnected}
							/>
							<Label htmlFor="auto-stream" className="text-foreground cursor-pointer text-xs font-medium">
								自动推送数据流
							</Label>
						</div>

						<Select value={streamInterval} onValueChange={setStreamInterval} disabled={!isAutoStreaming}>
							<SelectTrigger className="h-8 w-24 text-xs">
								<SelectValue placeholder="频率" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1000">1 秒/次</SelectItem>
								<SelectItem value="2000">2 秒/次</SelectItem>
								<SelectItem value="5000">5 秒/次</SelectItem>
							</SelectContent>
						</Select>

						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={sendTelemetryPulse}
							disabled={isSendingPulse || !isConnected}
							className="text-xs"
						>
							<Send data-icon="inline-start" aria-hidden="true" />
							单次脉冲
						</Button>
					</div>
				</CardContent>
			</Card>

			<TelemetryKpiCards currentPoint={currentPoint} />

			<Card className="bg-card border-border shadow-xs">
				<CardHeader className="flex flex-col pb-2 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<CardTitle className="text-foreground text-base">高频实时数据流波形 (QPS 主线 vs TPS 副线)</CardTitle>
						<CardDescription className="text-muted-foreground text-xs">
							基于 WebSocket Push 动态更新的滚动时间序列波形，保持最近 25 个采样点
						</CardDescription>
					</div>
					<div className="mt-2 flex items-center gap-2 sm:mt-0">
						<Badge variant="outline" className="text-xs">
							<span className="bg-primary mr-1.5 inline-block size-2 rounded-full" aria-hidden="true" />
							QPS 吞吐
						</Badge>
						<Badge variant="outline" className="text-xs">
							<span className="bg-secondary mr-1.5 inline-block size-2 rounded-full" aria-hidden="true" />
							TPS 事务
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="pt-4">
					<LazyAreaTrendChart
						data={chartData}
						dataKey="value"
						secondaryDataKey="secondaryValue"
						xAxisKey="label"
						height={320}
						showGrid
						showTooltip
						isAnimationActive={false}
					/>
				</CardContent>
			</Card>
		</TabsContent>
	);
}
