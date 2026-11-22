"use client";

import { useTranslations } from "next-intl";

import { useMemoizedFn } from "ahooks";
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import { useLayoutAuth } from "../LayoutAuthContext";
import type { SidebarUser } from "./types";

function getUserInitials(name: string): string {
	if (!name) return "";
	return name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function NavUserSkeleton() {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size="lg" className="pointer-events-none">
					<Skeleton className="size-8 rounded-lg" />
					<div className="grid flex-1 gap-1.5 text-left">
						<Skeleton className="h-3.5 w-20" />
						<Skeleton className="h-2.5 w-28" />
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

export interface NavUserProps {
	defaultOpen?: boolean;
}

/** 头像 + 姓名/邮箱组合（侧栏按钮与下拉菜单头部共用） */
function UserIdentity({ user, initials }: { user: SidebarUser; initials: string }) {
	return (
		<>
			<Avatar className="h-8 w-8 rounded-lg after:rounded-lg [&_img]:rounded-lg">
				{user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
				<AvatarFallback className="rounded-lg">{initials || "U"}</AvatarFallback>
			</Avatar>
			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-medium">{user.name}</span>
				<span className="text-muted-foreground truncate text-xs">{user.email}</span>
			</div>
		</>
	);
}

export function NavUser({ defaultOpen }: NavUserProps) {
	const t = useTranslations("layout");
	const router = useRouter();
	const { isMobile, state } = useSidebar();
	const { user, onLogout, isLoggingOut = false } = useLayoutAuth();

	const handleLogout = useMemoizedFn(() => {
		onLogout?.();
	});

	if (!user) {
		return <NavUserSkeleton />;
	}

	const initials = getUserInitials(user.name);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu defaultOpen={defaultOpen}>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							tooltip={user.name}
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
						>
							<UserIdentity user={user} initials={initials} />
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "top"}
						align={state === "collapsed" ? "start" : "end"}
						sideOffset={4}
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<UserIdentity user={user} initials={initials} />
								</div>
							</DropdownMenuLabel>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem className="cursor-pointer">
								<Sparkles className="mr-2 size-4" />
								<span>{t("nav_user_upgrade_pro")}</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem className="cursor-pointer" onSelect={() => router.push("/profile")}>
								<BadgeCheck className="mr-2 size-4" />
								<span>{t("nav_user_account")}</span>
							</DropdownMenuItem>
							<DropdownMenuItem className="cursor-pointer">
								<CreditCard className="mr-2 size-4" />
								<span>{t("nav_user_billing")}</span>
							</DropdownMenuItem>
							<DropdownMenuItem className="cursor-pointer" onSelect={() => router.push("/notifications")}>
								<Bell className="mr-2 size-4" />
								<span>{t("nav_user_notifications")}</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								variant="destructive"
								className="cursor-pointer"
								onSelect={handleLogout}
								disabled={isLoggingOut || !onLogout}
							>
								<LogOut className="mr-2 size-4" />
								<span>{isLoggingOut ? t("nav_user_logging_out") : t("nav_user_logout")}</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
