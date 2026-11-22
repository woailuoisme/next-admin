"use client";

import { DoorOpen, Radio, Trash2, UserCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { PresenceEventLog } from "../constants";

export interface PresenceEventFeedProps {
	eventLogs: PresenceEventLog[];
	onClear: () => void;
}

export function PresenceEventFeed({ eventLogs, onClear }: PresenceEventFeedProps) {
	return (
		<Card className="bg-card border-border shadow-xs">
			<CardHeader className="flex flex-row items-center justify-between pb-3">
				<div>
					<CardTitle className="text-foreground text-sm font-semibold">席位动态事件瀑布</CardTitle>
					<CardDescription className="text-muted-foreground text-xs">实时捕获加入、离线与动作发布</CardDescription>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={onClear}
					className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
				>
					<Trash2 className="h-3.5 w-3.5" />
				</Button>
			</CardHeader>
			<CardContent className="p-0">
				<ScrollArea className="h-[460px] px-4 pb-4">
					<div className="space-y-3">
						{eventLogs.length === 0 ? (
							<div className="text-muted-foreground py-12 text-center text-xs">暂无动态事件</div>
						) : (
							eventLogs.map((evt) => (
								<div
									key={evt.id}
									className="border-border bg-card/60 flex flex-col gap-1 rounded-md border p-2.5 text-xs"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-1.5">
											{evt.type === "join" ? (
												<Badge variant="default" className="h-4 px-1 text-[10px]">
													<UserCheck className="mr-0.5 h-2.5 w-2.5" />
													上线
												</Badge>
											) : evt.type === "leave" ? (
												<Badge variant="destructive" className="h-4 px-1 text-[10px]">
													<DoorOpen className="mr-0.5 h-2.5 w-2.5" />
													离线
												</Badge>
											) : (
												<Badge variant="outline" className="h-4 px-1 text-[10px]">
													<Radio className="text-primary mr-0.5 h-2.5 w-2.5" />
													动作
												</Badge>
											)}
											<span className="text-foreground font-medium">{evt.name}</span>
										</div>
										<span className="text-muted-foreground font-mono text-[10px]">
											{new Date(evt.timestamp).toLocaleTimeString()}
										</span>
									</div>
									<p className="text-muted-foreground mt-0.5 text-xs">{evt.detail}</p>
								</div>
							))
						)}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
