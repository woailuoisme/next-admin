"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { TabsContent } from "@/components/ui/tabs";
import { useCentrifuge, useSubscription } from "@/integrations/centrifuge";

import { publishRealtime } from "../api";
import { BroadcasterComposerCard } from "../components/BroadcasterComposerCard";
import { BroadcasterFeedCard } from "../components/BroadcasterFeedCard";
import { INITIAL_BROADCAST_MESSAGES } from "../constants";
import type { StreamMessageItem } from "../types";

export function BroadcasterShowcaseTab() {
	const { isConnected } = useCentrifuge();
	const [messages, setMessages] = useState<StreamMessageItem[]>(INITIAL_BROADCAST_MESSAGES);
	const [isPaused, setIsPaused] = useState(false);
	const [filterLevel, setFilterLevel] = useState<string>("all");
	const [filterChannel, setFilterChannel] = useState<string>("all");

	const [targetChannel, setTargetChannel] = useState("public:demo");
	const [messageLevel, setMessageLevel] = useState<"info" | "success" | "warning" | "error">("info");
	const [title, setTitle] = useState("新订单已支付成功");
	const [content, setContent] = useState("订单号 #ORD-2026-9921，金额 ¥3,480.00，已通过实时通道下发履约通知");

	const handlePublicDemoPub = (pub: { data: Record<string, unknown>; offset?: number }) => {
		if (isPaused) return;
		const data = pub.data;
		setMessages((prev) => [
			{
				id: (data.id as string) || `msg-${Date.now()}-${Math.random()}`,
				channel: "public:demo",
				topic: (data.topic as StreamMessageItem["topic"]) || "custom",
				level: (data.level as StreamMessageItem["level"]) || "info",
				title: (data.title as string) || "实时广播事件",
				content: (data.content as string) || JSON.stringify(data),
				sender: (data.sender as string) || "anonymous_operator",
				timestamp: (data.timestamp as number) || Date.now(),
				offset: pub.offset,
				rawPayload: data,
			},
			...prev.slice(0, 100),
		]);
	};

	const handleNotificationPub = (pub: { data: Record<string, unknown>; offset?: number }) => {
		const data = pub.data;
		const level = (data.level as StreamMessageItem["level"]) || "info";
		const itemTitle = (data.title as string) || "系统广播通知";
		const itemContent = (data.content as string) || "";
		const toastByLevel = { error: toast.error, warning: toast.warning, success: toast.success, info: toast.info };
		(toastByLevel[level] ?? toast.info)(itemTitle, { description: itemContent });

		if (isPaused) return;
		setMessages((prev) => [
			{
				id: (data.id as string) || `notif-${Date.now()}-${Math.random()}`,
				channel: "notification",
				topic: "notification",
				level,
				title: itemTitle,
				content: itemContent,
				sender: (data.sender as string) || "notification_broker",
				timestamp: (data.timestamp as number) || Date.now(),
				offset: pub.offset,
				rawPayload: data,
			},
			...prev.slice(0, 100),
		]);
	};

	useSubscription("public:demo", handlePublicDemoPub);
	useSubscription("notification", handleNotificationPub);

	const { mutate: publishBroadcast, isPending: isPublishing } = useMutation({
		mutationFn: async (vars: {
			channel: string;
			payload: {
				id: string;
				topic: "notification" | "custom";
				level: "info" | "success" | "warning" | "error";
				title: string;
				content: string;
				sender: string;
				timestamp: number;
				clientInfo: { agent: string; locale: string };
			};
		}) => {
			const res = await publishRealtime(vars.channel, vars.payload);
			if (!res.ok) throw new Error("PUBLISH_FAILED");
			return vars.channel;
		},
		onSuccess: (channel) => toast.success("广播消息已投递至 Centrifugo", { description: `目标频道: ${channel}` }),
		onError: (e) => {
			if (e instanceof Error && e.message === "PUBLISH_FAILED") {
				toast.error("广播发送失败，请检查容器状态");
			} else {
				console.warn("Failed to publish broadcast:", e);
				toast.error("网络异常，无法投递消息");
			}
		},
	});

	const handleSendBroadcast = () => {
		if (!title.trim() || !content.trim()) return;
		publishBroadcast({
			channel: targetChannel,
			payload: {
				id: `msg-${Date.now()}`,
				topic: targetChannel === "notification" ? "notification" : "custom",
				level: messageLevel,
				title: title.trim(),
				content: content.trim(),
				sender: "admin_console",
				timestamp: Date.now(),
				clientInfo: { agent: "Admin Panel Showcase", locale: "zh-CN" },
			},
		});
	};

	const applyTemplate = (
		tmplTitle: string,
		tmplContent: string,
		tmplLevel: "info" | "success" | "warning" | "error",
		tmplChannel: string,
	) => {
		setTitle(tmplTitle);
		setContent(tmplContent);
		setMessageLevel(tmplLevel);
		setTargetChannel(tmplChannel);
	};

	const filteredMessages = messages.filter((m) => {
		if (filterLevel !== "all" && m.level !== filterLevel) return false;
		if (filterChannel !== "all" && m.channel !== filterChannel) return false;
		return true;
	});

	return (
		<TabsContent value="broadcaster" className="flex flex-col gap-6">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
				<BroadcasterComposerCard
					targetChannel={targetChannel}
					onTargetChannelChange={setTargetChannel}
					messageLevel={messageLevel}
					onMessageLevelChange={setMessageLevel}
					title={title}
					onTitleChange={setTitle}
					content={content}
					onContentChange={setContent}
					isConnected={isConnected}
					isPublishing={isPublishing}
					onApplyTemplate={applyTemplate}
					onSend={handleSendBroadcast}
				/>

				<BroadcasterFeedCard
					messages={messages}
					filteredMessages={filteredMessages}
					isPaused={isPaused}
					onTogglePause={() => setIsPaused((prev) => !prev)}
					onClear={() => setMessages([])}
					filterLevel={filterLevel}
					onFilterLevelChange={setFilterLevel}
					filterChannel={filterChannel}
					onFilterChannelChange={setFilterChannel}
				/>
			</div>
		</TabsContent>
	);
}
