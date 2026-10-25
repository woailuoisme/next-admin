"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, memo, useCallback, useRef } from "react";

import { HeaderNav } from "@/components/layout/HeaderNav";
import { AppSidebar } from "@/components/layout/sidebar/AppSidebar";
import { BackToTop } from "@/components/shared/BackToTop";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export interface DashboardShellProps {
  children: ReactNode;
}

export const DashboardShell = memo(function DashboardShell({ children }: DashboardShellProps) {
  const t = useTranslations("layout");
  const mainRef = useRef<HTMLDivElement>(null);
  const getMainTarget = useCallback(() => mainRef.current, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-xs focus:font-medium focus:shadow-md focus:outline-hidden"
      >
        {t("skip_to_content")}
      </a>
      <AppSidebar />
      <SidebarInset className="flex flex-1 flex-col overflow-hidden">
        <HeaderNav />
        <div
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          role="region"
          aria-label={t("skip_to_content")}
          className="flex-1 overflow-y-auto p-4 outline-hidden md:p-6 lg:p-8"
        >
          {children}
        </div>
        <BackToTop target={getMainTarget} />
      </SidebarInset>
    </SidebarProvider>
  );
});
