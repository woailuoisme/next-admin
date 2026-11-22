"use client";

import {
	AlertCircle,
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	Filter,
	Info,
	Pause,
	Play,
	Trash2,
	Volume2,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { StreamMessageItem } from "../types";

export interface BroadcasterFeedCardProps {
	messages: StreamMessageItem[];
	filteredMessages: StreamMessageItem[];
	isPaused: boolean;
	onTogglePause: () => void;
	onClear: () => void;
	filterLevel: string;
	onFilterLevelChange: (val: string) => void;
	filterChannel: string;
	onFilterChannelChange: (val: string) => void;
}

function LevelBadge({ level }: { level: StreamMessageItem["level"] }) {
	if (level === "success") {
		return (
			<Badge variant="default" className="h-5 px-1.5 text-[10px]">
				<CheckCircle2 className="mr-1 h-3 w-3" />
				SUCCESS
			</Badge>
		);
	}
	if (level === "warning") {
		return (
			<Badge variant="outline" className="border-chart-4/30 text-chart-4 h-5 px-1.5 text-[10px]">
				<AlertCircle className="mr-1 size-3" />
				WARNING
			</Badge>
		);
	}
	if (level === "error") {
		return (
			<Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
				<AlertCircle className="mr-1 h-3 w-3" />
				ERROR
			</Badge>
		);
	}
	return (
		<Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
			<Info className="mr-1 h-3 w-3" />
			INFO
		</Badge>
	);
}

export function BroadcasterFeedCard({
	messages,
	filteredMessages,
	isPaused,
	onTogglePause,
	onClear,
	filterLevel,
	onFilterLevelChange,
	filterChannel,
	onFilterChannelChange,
}: BroadcasterFeedCardProps) {
	const [expandedPayloads, setExpandedPayloads] = useState<Record<string, boolean>>({});

	const toggleExpand = (id: string) => {
		setExpandedPayloads((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	return (
		<div className="space-y-4 lg:col-span-3">
			<Card className="bg-card border-border shadow-xs">
				<CardHeader className="flex flex-col pb-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<CardTitle className="text-foreground flex items-center gap-2 text-sm font-semibold">
							<Volume2 className="text-primary h-4 w-4" />
							实时消息接收瀑布流 · 共 {messages.length} 条
						</CardTitle>
						<CardDescription className="text-muted-foreground text-xs">
							通过 WebSocket 实时监听多频道 Publication 事件
						</CardDescription>
					</div>

					<div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0">
						<Button variant="outline" size="sm" onClick={onTogglePause} className="h-7 gap-1 text-xs">
							{isPaused ? (
								<>
									<Play className="text-primary h-3 w-3" />
									恢复接收
								</>
							) : (
								<>
									<Pause className="h-3 w-3" />
									暂停滚动
								</>
							)}
						</Button>

						<Button
							variant="ghost"
							size="sm"
							onClick={onClear}
							className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
						>
							<Trash2 className="h-3.5 w-3.5" />
							清空
						</Button>
					</div>
				</CardHeader>

				<div className="border-border bg-muted/40 flex flex-wrap items-center justify-between gap-2 border-y px-4 py-2">
					<div className="flex items-center gap-2">
						<Filter className="text-muted-foreground h-3.5 w-3.5" />
						<span className="text-muted-foreground text-xs">过滤:</span>
						<Select value={filterLevel} onValueChange={onFilterLevelChange}>
							<SelectTrigger className="h-7 w-24 text-xs">
								<SelectValue placeholder="级别" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">所有级别</SelectItem>
								<SelectItem value="info">Info</SelectItem>
								<SelectItem value="success">Success</SelectItem>
								<SelectItem value="warning">Warning</SelectItem>
								<SelectItem value="error">Error</SelectItem>
							</SelectContent>
						</Select>

						<Select value={filterChannel} onValueChange={onFilterChannelChange}>
							<SelectTrigger className="h-7 w-28 text-xs">
								<SelectValue placeholder="频道" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">所有频道</SelectItem>
								<SelectItem value="public:demo">public:demo</SelectItem>
								<SelectItem value="notification">notification</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{isPaused ? (
						<Badge variant="outline" className="border-chart-4/30 text-chart-4 text-[10px]">
							已暂停滚动更新
						</Badge>
					) : null}
				</div>

				<CardContent className="p-0">
					<ScrollArea className="h-[460px] p-4">
						<div className="space-y-3">
							{filteredMessages.length === 0 ? (
								<div className="text-muted-foreground py-16 text-center text-xs">
									暂无广播消息，请在左侧发送一条测试消息
								</div>
							) : (
								filteredMessages.map((msg) => {
									const isExpanded = !!expandedPayloads[msg.id];
									return (
										<div
											key={msg.id}
											className="border-border bg-card hover:bg-muted/30 flex flex-col gap-2 rounded-lg border p-3 text-xs shadow-xs transition-colors"
										>
											<div className="flex flex-wrap items-center justify-between gap-2">
												<div className="flex items-center gap-2">
													<LevelBadge level={msg.level} />
													<Badge variant="outline" className="font-mono text-[10px]">
														{msg.channel}
													</Badge>
													{msg.offset !== undefined ? (
														<span className="text-muted-foreground font-mono text-[10px]">#{msg.offset}</span>
													) : null}
												</div>
												<span className="text-muted-foreground font-mono text-[10px]">
													{new Date(msg.timestamp).toLocaleTimeString()}
												</span>
											</div>

											<div>
												<h4 className="text-foreground text-xs font-semibold">{msg.title}</h4>
												<p className="text-muted-foreground mt-0.5 text-xs">{msg.content}</p>
											</div>

											{msg.rawPayload ? (
												<div className="mt-1">
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => toggleExpand(msg.id)}
														className="text-muted-foreground hover:text-foreground h-auto gap-1 px-1 py-0.5 font-mono text-[10px]"
													>
														{isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
														<span>原始 JSON Payload</span>
													</Button>
													{isExpanded ? (
														<pre className="bg-muted text-muted-foreground mt-1.5 max-h-40 overflow-auto rounded-md p-2 font-mono text-[10px]">
															{JSON.stringify(msg.rawPayload, null, 2)}
														</pre>
													) : null}
												</div>
											) : null}
										</div>
									);
								})
							)}
						</div>
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);
}
