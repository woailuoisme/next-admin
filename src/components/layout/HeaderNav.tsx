"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import { useRouteTitle } from "@/components/layout/sidebar/menu.config";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { GlitchTipDiagnostic } from "@/components/shared/GlitchTipDiagnostic";
import { ThemeColorPicker } from "@/components/shared/ThemeColorPicker";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
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

import type { NavGroup } from "./sidebar/types";
import { GlobalSearch } from "./search/GlobalSearch";

export interface HeaderNavProps {
	/** 业务层注入的头部右侧扩展插槽（例如 ConnectedNotificationBell） */
	rightSlot?: ReactNode;
	customGroups?: NavGroup[];
}

export function HeaderNav({ rightSlot, customGroups }: HeaderNavProps) {
	const t = useTranslations("layout");
	const pathname = usePathname();
	const pageTitle = useRouteTitle(pathname, undefined, customGroups);

	return (
		<header className="border-border/60 bg-background/95 sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b px-4 backdrop-blur-md">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mr-2 h-4" />
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild className="text-xs">
								<Link href="/overview">{t("breadcrumb_root")}</Link>
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
				<GlobalSearch customGroups={customGroups} />
				{rightSlot}
				<Separator orientation="vertical" className="h-4" />
				<LanguageSwitcher />
				<ThemeColorPicker footerSlot={<GlitchTipDiagnostic />} />
				<ThemeToggle />
			</div>
		</header>
	);
}
