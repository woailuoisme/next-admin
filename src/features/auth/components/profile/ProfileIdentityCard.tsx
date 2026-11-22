"use client";

import { CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { CopyButton } from "@/components/shared/CopyButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type { AdminRole, AdminUser, AdminUserStatus } from "../../types";

function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
	}
	return name.slice(0, 2).toUpperCase();
}

function getStatusVariant(status: AdminUserStatus): "default" | "secondary" | "destructive" {
	if (status === "active") return "default";
	if (status === "suspended") return "destructive";
	return "secondary";
}

export interface ProfileIdentityCardProps {
	admin: AdminUser;
	roleLabels: Record<AdminRole, string>;
	onJumpToSecurity: () => void;
}

export function ProfileIdentityCard({ admin, roleLabels, onJumpToSecurity }: ProfileIdentityCardProps) {
	const t = useTranslations("profile");
	const locale = useLocale();

	const statusLabels: Record<AdminUserStatus, string> = {
		active: t("status_active"),
		inactive: t("status_inactive"),
		suspended: t("status_suspended"),
	};

	const formatDate = (iso: string) => {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
	};

	return (
		<Card>
			<CardContent className="space-y-5 p-6">
				<div className="flex flex-col items-center text-center">
					<Avatar className="border-border size-20 border">
						<AvatarImage src={admin.avatarUrl} alt={admin.name} />
						<AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
							{getInitials(admin.name)}
						</AvatarFallback>
					</Avatar>

					<h2 className="text-foreground mt-3 text-lg font-semibold">{admin.name}</h2>
					<p className="text-muted-foreground flex items-center gap-1.5 text-xs">
						<Mail className="size-3.5" />
						{admin.email}
					</p>

					<div className="mt-3 flex flex-wrap items-center justify-center gap-2">
						<Badge variant="secondary">{roleLabels[admin.role] ?? admin.role}</Badge>
						<Badge variant={getStatusVariant(admin.status)}>{statusLabels[admin.status] ?? admin.status}</Badge>
					</div>
				</div>

				<Separator />

				<dl className="space-y-3 text-xs">
					<div className="flex items-center justify-between gap-2">
						<dt className="text-muted-foreground">{t("account_id")}</dt>
						<dd className="text-foreground flex items-center gap-1 font-mono">
							<span>{admin.id}</span>
							<CopyButton text={admin.id} />
						</dd>
					</div>
					<div className="flex items-center justify-between gap-2">
						<dt className="text-muted-foreground">{t("joined_at")}</dt>
						<dd className="text-foreground font-medium">{formatDate(admin.createdAt)}</dd>
					</div>
					<div className="flex items-center justify-between gap-2">
						<dt className="text-muted-foreground">{t("last_active")}</dt>
						<dd className="text-foreground font-medium">{formatDate(admin.lastActiveAt)}</dd>
					</div>
				</dl>

				<Separator />

				<div className="space-y-3">
					<p className="text-foreground text-xs font-semibold">{t("security_status_title")}</p>
					<div className="space-y-2 text-xs">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground flex items-center gap-1.5">
								<CheckCircle2 className="text-chart-2 size-3.5" />
								{t("email_verified")}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground flex items-center gap-1.5">
								<ShieldCheck className="text-chart-2 size-3.5" />
								{t("password_protected")}
							</span>
							<Button
								type="button"
								variant="link"
								size="sm"
								onClick={onJumpToSecurity}
								className="h-auto cursor-pointer p-0 text-xs"
							>
								{t("quick_change_password")}
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
