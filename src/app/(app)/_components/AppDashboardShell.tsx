"use client";

import { useMemoizedFn } from "ahooks";
import { type ReactNode, useMemo } from "react";

import { DashboardShell, type SidebarUser } from "@/components/layout";
import { useAuthSession, useLogoutMutation } from "@/features/auth";
import { ConnectedNotificationBell } from "@/features/notifications";

export function AppDashboardShell({ children }: { children: ReactNode }) {
  const session = useAuthSession();
  const logoutMutation = useLogoutMutation();
  const admin = session?.admin;

  const user = useMemo<SidebarUser | null>(() => {
    if (!admin) return null;
    return {
      name: admin.name,
      email: admin.email,
      avatar: admin.avatarUrl ?? "",
      role: admin.role,
    };
  }, [admin]);

  const handleLogout = useMemoizedFn(() => {
    logoutMutation.mutate();
  });

  const auth = useMemo(
    () => ({
      user,
      onLogout: handleLogout,
      isLoggingOut: logoutMutation.isPending,
    }),
    [handleLogout, logoutMutation.isPending, user],
  );

  return (
    <DashboardShell auth={auth} headerRightSlot={<ConnectedNotificationBell />}>
      {children}
    </DashboardShell>
  );
}
