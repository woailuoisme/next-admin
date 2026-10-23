"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";

import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { getRouteTitle } from "@/components/layout/sidebar/menu.config";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeColorPicker } from "@/components/shared/ThemeColorPicker";
import ThemeToggle from "@/components/shared/ThemeToggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { GlobalSearch } from "./search/GlobalSearch";

export const HeaderNav = memo(function HeaderNav() {
  const pathname = usePathname();
  const pageTitle = getRouteTitle(pathname);

  return (
    <header className="border-border/60 bg-background/95 sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b px-4 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-xs">
                <Link href="/overview">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground text-xs font-medium">{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        <GlobalSearch />
        <NotificationBell />
        <Separator orientation="vertical" className="h-4" />
        <LanguageSwitcher />
        <ThemeColorPicker />
        <ThemeToggle />
      </div>
    </header>
  );
});
