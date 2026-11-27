"use client";

import { AlertCircle, Bell, CheckCheck, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { NotificationsInboxTab } from "../components/NotificationsInboxTab";
import { NotificationsPreferencesTab } from "../components/NotificationsPreferencesTab";
import { useMarkAllAsReadMutation, useNotifications, useRealtimeNotifications } from "../hooks";

export function NotificationsPage() {
	const t = useTranslations("notification");
	const [sectionTab, setSectionTab] = useState<"inbox" | "preferences">("inbox");

	useRealtimeNotifications();

	const { data, isLoading, isError, refetch } = useNotifications();
	const markAllAsReadMutation = useMarkAllAsReadMutation();

	const allItems = data?.items ?? [];
	const unreadCount = data?.unreadCount ?? 0;

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2.5">
						<h1 className="text-foreground text-2xl font-semibold tracking-tight">{t("page_title")}</h1>
						<Badge variant={unreadCount > 0 ? "default" : "secondary"} className="tabular-nums">
							{unreadCount > 0 ? t("unread_count", { count: unreadCount }) : t("all_synced")}
						</Badge>
					</div>
					<p className="text-muted-foreground text-sm">{t("page_subtitle")}</p>
				</div>

				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
					onClick={() => markAllAsReadMutation.mutate()}
					className="cursor-pointer self-start sm:self-auto"
				>
					<CheckCheck data-icon="inline-start" aria-hidden="true" />
					{t("mark_all_read")}
				</Button>
			</div>

			{isError && !data ? (
				<Alert variant="destructive">
					<AlertCircle aria-hidden="true" />
					<AlertDescription className="flex flex-col gap-3">
						<span>{t("load_error")}</span>
						<div>
							<Button type="button" variant="outline" size="xs" onClick={() => void refetch()}>
								{t("retry")}
							</Button>
						</div>
					</AlertDescription>
				</Alert>
			) : null}

			<Tabs value={sectionTab} onValueChange={(v) => setSectionTab(v as "inbox" | "preferences")}>
				<TabsList>
					<TabsTrigger value="inbox" className="gap-1.5">
						<Bell className="size-3.5" aria-hidden="true" />
						{t("inbox_tab")}
					</TabsTrigger>
					<TabsTrigger value="preferences" className="gap-1.5">
						<Settings2 className="size-3.5" aria-hidden="true" />
						{t("preferences_tab")}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="inbox" className="mt-4">
					<NotificationsInboxTab items={allItems} isLoading={isLoading} />
				</TabsContent>

				<TabsContent value="preferences" className="mt-4">
					<NotificationsPreferencesTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
