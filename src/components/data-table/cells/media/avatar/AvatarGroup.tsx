import { useTranslations } from "next-intl";

import { AvatarGroup as UiAvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import type { AvatarItem } from "./types";

import { AvatarThumb, avatarShapeClasses, avatarSizeClasses } from "./AvatarThumb";

interface StackedAvatarGroupProps {
	items: AvatarItem[];
	maxStacked?: number;
	size?: keyof typeof avatarSizeClasses;
	shape?: keyof typeof avatarShapeClasses;
}

function StackedAvatarGroupInner({ items, maxStacked = 3, size = "sm", shape = "circle" }: StackedAvatarGroupProps) {
	const t = useTranslations("table");
	const visibleItems = items.slice(0, maxStacked);
	const remainingItems = items.slice(maxStacked);
	const remainingCount = remainingItems.length;

	return (
		<UiAvatarGroup>
			{visibleItems.map((item, idx) => (
				<Tooltip key={`${item.src ?? ""}-${item.name ?? ""}-${idx}`}>
					<TooltipTrigger asChild>
						<AvatarThumb
							src={item.src}
							name={item.name}
							fallback={item.fallback}
							size={size}
							shape={shape}
							status={item.status}
							className="cursor-pointer transition-transform hover:z-10 hover:scale-105"
						/>
					</TooltipTrigger>
					<TooltipContent side="top" className="text-xs">
						<p className="font-semibold">{item.name || t("avatar_anonymous")}</p>
						{item.role || item.subtext ? (
							<p className="text-muted-foreground text-[11px]">{item.role || item.subtext}</p>
						) : null}
					</TooltipContent>
				</Tooltip>
			))}

			{remainingCount > 0 ? (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							className="focus-visible:ring-ring h-auto w-auto cursor-pointer rounded-full p-0 outline-hidden transition-transform hover:z-10 hover:scale-105 hover:bg-transparent focus-visible:ring-2"
							aria-label={t("avatar_view_more", { count: remainingCount })}
						>
							<AvatarGroupCount className={cn(avatarSizeClasses[size], avatarShapeClasses[shape])}>
								+{remainingCount}
							</AvatarGroupCount>
						</Button>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-64 p-3 shadow-lg">
						<div className="mb-2 flex items-center justify-between text-xs">
							<span className="text-foreground font-medium">{t("avatar_all_members")}</span>
							<span className="text-muted-foreground">{t("avatar_member_count", { count: items.length })}</span>
						</div>
						<Separator className="mb-2" />
						<div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
							{remainingItems.map((rem, remIdx) => (
								<div
									key={`${rem.src ?? ""}-${rem.name ?? ""}-${remIdx}`}
									className="hover:bg-muted/50 flex items-center gap-2.5 rounded-md p-1"
								>
									<AvatarThumb
										src={rem.src}
										name={rem.name}
										fallback={rem.fallback}
										size="xs"
										shape={shape}
										status={rem.status}
									/>
									<div className="min-w-0 flex-1">
										<p className="text-foreground truncate text-xs font-medium">{rem.name || t("avatar_anonymous")}</p>
										{rem.role || rem.subtext ? (
											<p className="text-muted-foreground truncate text-[11px]">{rem.role || rem.subtext}</p>
										) : null}
									</div>
								</div>
							))}
						</div>
					</PopoverContent>
				</Popover>
			) : null}
		</UiAvatarGroup>
	);
}

export const StackedAvatarGroup = StackedAvatarGroupInner;
