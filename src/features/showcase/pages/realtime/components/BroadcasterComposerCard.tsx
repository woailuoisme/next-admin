"use client";

import { Radio, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { BROADCASTER_TEMPLATES } from "../constants";

const TARGET_CHANNELS = [
	{ value: "public:demo", label: "public:demo (公共演示广播流)" },
	{ value: "notification", label: "notification (系统级轻提示 Toast)" },
	{ value: "public:telemetry", label: "public:telemetry (遥测指标流)" },
	{ value: "public:presence", label: "public:presence (席位协同流)" },
] as const;

const MESSAGE_LEVELS = [
	{ value: "info", label: "Info · 普通信息" },
	{ value: "success", label: "Success · 操作成功" },
	{ value: "warning", label: "Warning · 潜在警告" },
	{ value: "error", label: "Error · 故障告警" },
] as const;

export interface BroadcasterComposerCardProps {
	targetChannel: string;
	onTargetChannelChange: (val: string) => void;
	messageLevel: "info" | "success" | "warning" | "error";
	onMessageLevelChange: (val: "info" | "success" | "warning" | "error") => void;
	title: string;
	onTitleChange: (val: string) => void;
	content: string;
	onContentChange: (val: string) => void;
	isConnected: boolean;
	isPublishing: boolean;
	onApplyTemplate: (
		title: string,
		content: string,
		level: "info" | "success" | "warning" | "error",
		channel: string,
	) => void;
	onSend: () => void;
}

export function BroadcasterComposerCard({
	targetChannel,
	onTargetChannelChange,
	messageLevel,
	onMessageLevelChange,
	title,
	onTitleChange,
	content,
	onContentChange,
	isConnected,
	isPublishing,
	onApplyTemplate,
	onSend,
}: BroadcasterComposerCardProps) {
	return (
		<div className="space-y-4 lg:col-span-2">
			<Card className="bg-card border-border shadow-xs">
				<CardHeader className="pb-3">
					<CardTitle className="text-foreground flex items-center gap-2 text-sm font-semibold">
						<Radio className="text-primary h-4 w-4" />
						消息与广播发送控制台
					</CardTitle>
					<CardDescription className="text-muted-foreground text-xs">
						通过服务端代理以 APIKey 身份安全推送消息到 Centrifugo
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-1.5">
						<span className="text-muted-foreground text-xs font-medium">快速套用预设模板:</span>
						<div className="flex flex-wrap gap-1.5">
							{BROADCASTER_TEMPLATES.map((tpl) => (
								<Button
									key={tpl.label}
									variant="outline"
									size="sm"
									className="h-7 px-2 text-[11px]"
									onClick={() => onApplyTemplate(tpl.title, tpl.content, tpl.level, tpl.channel)}
								>
									{tpl.label}
								</Button>
							))}
						</div>
					</div>

					<div className="space-y-1.5">
						<span className="text-foreground text-xs font-medium">目标发布频道</span>
						<Select value={targetChannel} onValueChange={onTargetChannelChange}>
							<SelectTrigger className="h-9 text-xs">
								<SelectValue placeholder="选择频道" />
							</SelectTrigger>
							<SelectContent>
								{TARGET_CHANNELS.map((c) => (
									<SelectItem key={c.value} value={c.value}>
										{c.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5">
						<span className="text-foreground text-xs font-medium">通知级别 (Level)</span>
						<Select value={messageLevel} onValueChange={(v) => onMessageLevelChange(v as typeof messageLevel)}>
							<SelectTrigger className="h-9 text-xs">
								<SelectValue placeholder="选择级别" />
							</SelectTrigger>
							<SelectContent>
								{MESSAGE_LEVELS.map((l) => (
									<SelectItem key={l.value} value={l.value}>
										{l.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5">
						<span className="text-foreground text-xs font-medium">消息标题</span>
						<Input
							value={title}
							onChange={(e) => onTitleChange(e.target.value)}
							placeholder="输入通知标题..."
							className="h-9 text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<span className="text-foreground text-xs font-medium">消息正文详情</span>
						<Textarea
							value={content}
							onChange={(e) => onContentChange(e.target.value)}
							placeholder="输入详细消息内容..."
							rows={3}
							className="resize-none text-xs"
						/>
					</div>

					<Button
						variant="default"
						onClick={onSend}
						disabled={isPublishing || !isConnected || !title.trim() || !content.trim()}
						className="w-full gap-2 text-xs"
					>
						<Send className="h-3.5 w-3.5" />
						{isPublishing ? "正在广播下发..." : "立刻广播下发"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
