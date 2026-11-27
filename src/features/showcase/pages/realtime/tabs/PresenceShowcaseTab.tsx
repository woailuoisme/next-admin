"use client";

import { useMutation } from "@tanstack/react-query";
import { LogOut, Send, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { useCentrifuge, useSubscription } from "@/integrations/centrifuge";

import { publishRealtime } from "../api";
import { PresenceEventFeed } from "../components/PresenceEventFeed";
import { PresenceSeatGrid } from "../components/PresenceSeatGrid";
import { INITIAL_PRESENCE_EVENT_LOGS, INITIAL_PRESENCE_MEMBERS, type PresenceEventLog } from "../constants";
import type { PresenceMember } from "../types";

export function PresenceShowcaseTab() {
	const { isConnected } = useCentrifuge();
	const [members, setMembers] = useState<PresenceMember[]>(INITIAL_PRESENCE_MEMBERS);
	const [eventLogs, setEventLogs] = useState<PresenceEventLog[]>(INITIAL_PRESENCE_EVENT_LOGS);
	const [myActionInput, setMyActionInput] = useState("");
	const [pendingLeaveUsers, setPendingLeaveUsers] = useState<Set<string>>(() => new Set());

	const handlePresencePublication = (pub: { data: Record<string, unknown> }) => {
		const data = pub.data as {
			type?: "join" | "leave" | "action";
			user?: string;
			name?: string;
			role?: string;
			action?: string;
		};
		if (!data.user) return;

		const userName = data.name || data.user;
		const userRole = data.role || "Member";

		const pushLog = (type: PresenceEventLog["type"], detail: string) =>
			setEventLogs((prev) => [
				{
					id: `evt-${Date.now()}-${Math.random()}`,
					type,
					user: data.user as string,
					name: userName,
					role: userRole,
					detail,
					timestamp: Date.now(),
				},
				...prev.slice(0, 40),
			]);

		if (data.type === "join") {
			setMembers((prev) =>
				prev.some((m) => m.user === data.user)
					? prev
					: [
							...prev,
							{
								client: `client-${Date.now()}`,
								user: data.user as string,
								name: userName,
								role: userRole,
								joinedAt: Date.now(),
								lastAction: "刚接入协作空间",
							},
						],
			);
			pushLog("join", "实时上线加入当前频道");
		} else if (data.type === "leave") {
			setPendingLeaveUsers((prev) => {
				if (!prev.has(data.user as string)) return prev;
				const next = new Set(prev);
				next.delete(data.user as string);
				return next;
			});
			setMembers((prev) => prev.filter((m) => m.user !== data.user));
			pushLog("leave", "退出当前协同席位");
		} else if (data.type === "action") {
			const actionText = data.action || "更新了席位状态";
			setMembers((prev) => prev.map((m) => (m.user === data.user ? { ...m, lastAction: actionText } : m)));
			pushLog("action", actionText);
		}
	};

	useSubscription("public:presence", handlePresencePublication);

	const broadcastActionMutation = useMutation({
		mutationFn: async (action: string) => {
			const res = await publishRealtime("public:presence", {
				type: "action",
				user: "admin_operator",
				name: "系统超级管理员 (您)",
				role: "Admin",
				action,
			});
			if (!res.ok) throw new Error("PUBLISH_FAILED");
		},
		onSuccess: () => setMyActionInput(""),
		onError: () => toast.error("动作广播发送失败，请检查实时服务连接"),
	});

	const simulateJoinMutation = useMutation({
		mutationFn: async (payload: { user: string; name: string; role: string }) => {
			const res = await publishRealtime("public:presence", { type: "join", ...payload });
			if (!res.ok) throw new Error("PUBLISH_FAILED");
		},
		onError: () => toast.error("模拟同伴接入失败，请检查容器状态"),
	});

	const simulateLeaveMutation = useMutation({
		mutationFn: async (target: PresenceMember) => {
			const res = await publishRealtime("public:presence", {
				type: "leave",
				user: target.user,
				name: target.name,
				role: target.role,
			});
			if (!res.ok) throw new Error("PUBLISH_FAILED");
			return target.user;
		},
		onError: (_err, target) => {
			setPendingLeaveUsers((prev) => {
				const next = new Set(prev);
				next.delete(target.user);
				return next;
			});
			toast.error("模拟同伴离线失败，请重试");
		},
	});

	const handleBroadcastMyAction = () => {
		const trimmed = myActionInput.trim();
		if (!trimmed || broadcastActionMutation.isPending) return;
		broadcastActionMutation.mutate(trimmed);
	};

	const handleSimulateJoin = () => {
		const roles = ["Auditor", "Engineer", "Designer", "Support", "Operator"];
		const names = ["Lucas", "Sarah", "David", "Chloe", "William", "Zoe"];
		const randomName = names[Math.floor(Math.random() * names.length)];
		const randomRole = roles[Math.floor(Math.random() * roles.length)];
		const randomUser = `user_${randomName.toLowerCase()}_${Math.floor(Math.random() * 900 + 100)}`;

		simulateJoinMutation.mutate({
			user: randomUser,
			name: `${randomName} (${randomRole})`,
			role: randomRole,
		});
	};

	const leaveCandidates = members.filter((m) => m.user !== "admin_operator" && !pendingLeaveUsers.has(m.user));

	const handleSimulateLeave = () => {
		const target = leaveCandidates[leaveCandidates.length - 1];
		if (!target) return;
		setPendingLeaveUsers((prev) => new Set(prev).add(target.user));
		simulateLeaveMutation.mutate(target);
	};

	return (
		<TabsContent value="presence" className="flex flex-col gap-6">
			<Card className="bg-card border-border shadow-xs">
				<CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
							<Users className="size-5" aria-hidden="true" />
						</div>
						<div>
							<h3 className="text-foreground text-sm font-semibold">多席位协同感知 · 当前在线 {members.length} 人</h3>
							<p className="text-muted-foreground text-xs">
								订阅频道 public:presence，支持多客户端席位实时感知与协作事件同步
							</p>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleSimulateJoin}
							disabled={!isConnected || simulateJoinMutation.isPending}
							className="text-xs"
						>
							<UserPlus data-icon="inline-start" className="text-primary" aria-hidden="true" />
							模拟同伴接入
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleSimulateLeave}
							disabled={!isConnected || simulateLeaveMutation.isPending || leaveCandidates.length === 0}
							className="text-muted-foreground text-xs"
						>
							<LogOut data-icon="inline-start" aria-hidden="true" />
							模拟同伴离线
						</Button>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="flex flex-col gap-4 lg:col-span-2">
					<Card className="bg-card border-border shadow-xs">
						<CardHeader className="pb-3">
							<CardTitle className="text-foreground flex items-center justify-between text-sm font-semibold">
								<span>广播当前席位状态与动作</span>
								<Badge variant="outline" className="text-xs">
									当前操作者
								</Badge>
							</CardTitle>
							<CardDescription className="text-muted-foreground text-xs">
								在当前空间实时共享您正在进行的操作（例如处理工单、审查流水等）
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex gap-2">
								<Input
									value={myActionInput}
									onChange={(e) => setMyActionInput(e.target.value)}
									placeholder="输入您正在进行的操作... 例如：已核对 10 月末结算账单"
									className="h-9 text-xs"
									onKeyDown={(e) => {
										if (e.key === "Enter") handleBroadcastMyAction();
									}}
								/>
								<Button
									type="button"
									size="sm"
									onClick={handleBroadcastMyAction}
									disabled={broadcastActionMutation.isPending || !myActionInput.trim() || !isConnected}
									className="h-9 shrink-0 text-xs"
								>
									<Send data-icon="inline-start" aria-hidden="true" />
									广播
								</Button>
							</div>
						</CardContent>
					</Card>

					<PresenceSeatGrid members={members} />
				</div>

				<PresenceEventFeed eventLogs={eventLogs} onClear={() => setEventLogs([])} />
			</div>
		</TabsContent>
	);
}
