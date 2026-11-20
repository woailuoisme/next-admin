"use client";

import { Bell, CheckCheck, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

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

  const { data, isLoading } = useNotifications();
  const markAllAsReadMutation = useMarkAllAsReadMutation();

  const allItems = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
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
          className="cursor-pointer gap-1.5 self-start sm:self-auto"
        >
          <CheckCheck className="size-4" />
          {t("mark_all_read")}
        </Button>
      </div>

      <Tabs value={sectionTab} onValueChange={(v) => setSectionTab(v as "inbox" | "preferences")}>
        <TabsList>
          <TabsTrigger value="inbox" className="gap-1.5">
            <Bell className="size-3.5" />
            {t("inbox_tab")}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5">
            <Settings2 className="size-3.5" />
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
