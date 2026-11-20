"use client";

import { Bell, ShieldAlert, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useIsHydrated } from "@/hooks/useIsHydrated";

interface NotificationChannelPref {
  inApp: boolean;
  emailDigest: boolean;
}

interface NotificationPreferencesState {
  soundEnabled: boolean;
  channels: Record<"system" | "order" | "security", NotificationChannelPref>;
}

const PREF_STORAGE_KEY = "next_admin_notification_preferences_v1";

const DEFAULT_PREFERENCES: NotificationPreferencesState = {
  soundEnabled: true,
  channels: {
    system: { inApp: true, emailDigest: false },
    order: { inApp: true, emailDigest: true },
    security: { inApp: true, emailDigest: true },
  },
};

function readNotificationPreferences(): NotificationPreferencesState {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(PREF_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<NotificationPreferencesState>;
    return {
      soundEnabled: parsed.soundEnabled ?? DEFAULT_PREFERENCES.soundEnabled,
      channels: {
        system: { ...DEFAULT_PREFERENCES.channels.system, ...parsed.channels?.system },
        order: { ...DEFAULT_PREFERENCES.channels.order, ...parsed.channels?.order },
        security: { ...DEFAULT_PREFERENCES.channels.security, ...parsed.channels?.security },
      },
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function NotificationsPreferencesTab() {
  const t = useTranslations("notification");
  const isHydrated = useIsHydrated();
  const [preferencesOverride, setPreferencesOverride] = useState<NotificationPreferencesState | null>(null);
  const preferences = preferencesOverride ?? (isHydrated ? readNotificationPreferences() : DEFAULT_PREFERENCES);

  const updatePreference = (next: NotificationPreferencesState) => {
    setPreferencesOverride(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
    }
    toast.success(t("pref_saved"));
  };

  const preferenceRows = [
    {
      key: "system" as const,
      title: t("pref_category_system"),
      desc: t("pref_category_system_desc"),
      Icon: Bell,
    },
    {
      key: "order" as const,
      title: t("pref_category_order"),
      desc: t("pref_category_order_desc"),
      Icon: ShoppingBag,
    },
    {
      key: "security" as const,
      title: t("pref_category_security"),
      desc: t("pref_category_security_desc"),
      Icon: ShieldAlert,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("preferences_title")}</CardTitle>
        <CardDescription>{t("preferences_desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-border flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="pref-sound-switch" className="text-sm font-medium">
              {t("pref_sound")}
            </Label>
          </div>
          <Switch
            id="pref-sound-switch"
            checked={preferences.soundEnabled}
            onCheckedChange={(checked) =>
              updatePreference({
                ...preferences,
                soundEnabled: checked,
              })
            }
          />
        </div>

        <div className="divide-border border-border divide-y rounded-lg border">
          {preferenceRows.map(({ key, title, desc, Icon }) => {
            const channel = preferences.channels[key];
            return (
              <div key={key} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-muted mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="text-muted-foreground size-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-muted-foreground text-xs">{desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 self-end sm:self-center">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`pref-${key}-in-app`}
                      checked={channel.inApp}
                      onCheckedChange={(checked) =>
                        updatePreference({
                          ...preferences,
                          channels: {
                            ...preferences.channels,
                            [key]: { ...channel, inApp: checked },
                          },
                        })
                      }
                    />
                    <Label htmlFor={`pref-${key}-in-app`} className="cursor-pointer text-xs">
                      {t("pref_in_app")}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`pref-${key}-email`}
                      checked={channel.emailDigest}
                      onCheckedChange={(checked) =>
                        updatePreference({
                          ...preferences,
                          channels: {
                            ...preferences.channels,
                            [key]: { ...channel, emailDigest: checked },
                          },
                        })
                      }
                    />
                    <Label htmlFor={`pref-${key}-email`} className="cursor-pointer text-xs">
                      {t("pref_email_digest")}
                    </Label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
