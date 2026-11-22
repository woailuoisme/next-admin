"use client";

import { LogOut, Send, UserPlus, Users } from "lucide-react";
import { useCallback, useState } from "react";

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
	const [isPublishing, setIsPublishing] = useState(false);

	const handlePresencePublication = useCallback((pub: { data: Record<string, unknown> }) => {
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
			setMembers((prev) => prev.filter((m) => m.user !== data.user));
			pushLog("leave", "退出当前协同席位");
		} else if (data.type === "action") {
			const actionText = data.action || "更新了席位状态";
			setMembers((prev) => prev.map((m) => (m.user === data.user ? { ...m, lastAction: actionText } : m)));
			pushLog("action", actionText);
		}
	}, []);

	useSubscription("public:presence", handlePresencePublication);

	const handleBroadcastMyAction = async () => {
		if (!myActionInput.trim()) return;
		setIsPublishing(true);
		try {
			await publishRealtime("public:presence", {
				type: "action",
				user: "admin_operator",
				name: "系统超级管理员 (您)",
				role: "Admin",
				action: myActionInput.trim(),
			});
			setMyActionInput("");
		} catch (e) {
			console.warn("Failed to publish presence action:", e);
		} finally {
			setIsPublishing(false);
		}
	};

	const handleSimulateJoin = async () => {
		const roles = ["Auditor", "Engineer", "Designer", "Support", "Operator"];
		const names = ["Lucas", "Sarah", "David", "Chloe", "William", "Zoe"];
		const randomName = names[Math.floor(Math.random() * names.length)];
		const randomRole = roles[Math.floor(Math.random() * roles.length)];
		const randomUser = `user_${randomName.toLowerCase()}_${Math.floor(Math.random() * 900 + 100)}`;

		try {
			await publishRealtime("public:presence", {
				type: "join",
				user: randomUser,
				name: `${randomName} (${randomRole})`,
				role: randomRole,
			});
		} catch (e) {
			console.warn("Simulate join error:", e);
		}
	};

	const handleSimulateLeave = async () => {
		const candidates = members.filter((m) => m.user !== "admin_operator");
		const target = candidates[candidates.length - 1];
		if (!target) return;

		try {
			await publishRealtime("public:presence", {
				type: "leave",
				user: target.user,
				name: target.name,
				role: target.role,
			});
		} catch (e) {
			console.warn("Simulate leave error:", e);
		}
	};

	return (
		<TabsContent value="presence" className="space-y-6">
			<Card className="bg-card border-border shadow-xs">
				<CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
							<Users className="h-5 w-5" />
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
							variant="outline"
							size="sm"
							onClick={handleSimulateJoin}
							disabled={!isConnected}
							className="h-8 gap-1.5 text-xs"
						>
							<UserPlus className="text-primary h-3.5 w-3.5" />
							模拟同伴接入
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleSimulateLeave}
							disabled={!isConnected || members.filter((m) => m.user !== "admin_operator").length === 0}
							className="text-muted-foreground h-8 gap-1.5 text-xs"
						>
							<LogOut className="h-3.5 w-3.5" />
							模拟同伴离线
						</Button>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="space-y-4 lg:col-span-2">
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
									size="sm"
									onClick={handleBroadcastMyAction}
									disabled={isPublishing || !myActionInput.trim() || !isConnected}
									className="h-9 shrink-0 gap-1.5 text-xs"
								>
									<Send className="h-3.5 w-3.5" />
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
