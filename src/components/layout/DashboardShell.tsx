"use client";

import { useTranslations } from "next-intl";
import { memo, type ReactNode, useCallback, useRef } from "react";

import { HeaderNav } from "@/components/layout/HeaderNav";
import { AppSidebar } from "@/components/layout/sidebar/AppSidebar";
import type { NavGroup } from "@/components/layout/sidebar/types";
import { BackToTop } from "@/components/shared/BackToTop";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { type LayoutAuthContextValue, LayoutAuthProvider } from "./LayoutAuthContext";

export interface DashboardShellProps {
  children: ReactNode;
  auth?: LayoutAuthContextValue;
  customGroups?: NavGroup[];
  headerRightSlot?: ReactNode;
}

export const DashboardShell = memo(function DashboardShell({
  children,
  auth,
  customGroups,
  headerRightSlot,
}: DashboardShellProps) {
  const t = useTranslations("layout");
  const mainRef = useRef<HTMLDivElement>(null);
  const getMainTarget = useCallback(() => mainRef.current, []);

  return (
    <LayoutAuthProvider user={auth?.user} onLogout={auth?.onLogout} isLoggingOut={auth?.isLoggingOut}>
      <SidebarProvider defaultOpen={true}>
        <a
          href="#main-content"
          className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-xs focus:font-medium focus:shadow-md focus:outline-hidden"
        >
          {t("skip_to_content")}
        </a>
        <AppSidebar customGroups={customGroups} />
        <SidebarInset className="flex flex-1 flex-col overflow-hidden">
          <HeaderNav rightSlot={headerRightSlot} />
          <div
            ref={mainRef}
            id="main-content"
            tabIndex={-1}
            role="region"
            aria-label={t("main_content_aria")}
            className="flex-1 overflow-y-auto p-4 outline-hidden md:p-6 lg:p-8"
          >
            {children}
          </div>
          <BackToTop target={getMainTarget} />
        </SidebarInset>
      </SidebarProvider>
    </LayoutAuthProvider>
  );
});
