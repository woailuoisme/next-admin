"use client";

import type { ReactNode } from "react";
import { BackToTop } from "@/components/back-to-top";
import { HeaderNav } from "@/components/layout/header-nav";
import { AppSidebar } from "@/components/layout/sidebar/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="flex flex-1 flex-col overflow-hidden">
        <HeaderNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
        <BackToTop />
      </SidebarInset>
    </SidebarProvider>
  );
}
