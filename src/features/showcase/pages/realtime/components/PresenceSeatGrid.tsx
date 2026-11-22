"use client";

import { Clock, Shield } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import type { PresenceMember } from "../types";

export function PresenceSeatGrid({ members }: { members: PresenceMember[] }) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{members.map((member) => {
				const isMe = member.user === "admin_operator";
				return (
					<Card
						key={member.client + member.user}
						className={`bg-card border-border hover:border-primary/40 p-4 shadow-xs transition-all ${
							isMe ? "ring-primary/20 ring-1" : ""
						}`}
					>
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-3">
								<Avatar size="default">
									<AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
										{member.name.slice(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div>
									<div className="flex items-center gap-1.5">
										<span className="text-foreground text-sm font-medium">{member.name}</span>
										{isMe ? (
											<Badge variant="default" className="h-4 px-1 text-[10px]">
												YOU
											</Badge>
										) : null}
									</div>
									<span className="text-muted-foreground font-mono text-xs">@{member.user}</span>
								</div>
							</div>
							<Badge variant="secondary" className="text-[10px]">
								<Shield className="mr-1 h-3 w-3" />
								{member.role}
							</Badge>
						</div>
						<div className="bg-muted/50 mt-3 rounded-md p-2.5">
							<p className="text-foreground text-xs font-normal">{member.lastAction}</p>
							<div className="text-muted-foreground mt-2 flex items-center gap-1 text-[10px]">
								<Clock className="h-3 w-3" />
								<span>接入时间: {new Date(member.joinedAt).toLocaleTimeString()}</span>
							</div>
						</div>
					</Card>
				);
			})}
		</div>
	);
}
