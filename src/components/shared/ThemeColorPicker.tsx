"use client";

import { Palette } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useActiveThemeMeta } from "@/stores/preferences";
import { cn } from "cn";

import { resolveLocalizedThemeName, ThemePickerPopoverContent } from "./ThemePickerPopoverContent";

export interface ThemeColorPickerProps {
	className?: string;
	title?: string;
	ariaLabel?: string;
	footerSlot?: ReactNode;
}

export function ThemeColorPicker({ className, title, ariaLabel, footerSlot }: ThemeColorPickerProps) {
	const t = useTranslations("shared");
	const ctxLocale = useLocale();
	const activeThemeMeta = useActiveThemeMeta();

	const [open, setOpen] = useState(false);

	const activeThemeName = resolveLocalizedThemeName(activeThemeMeta, ctxLocale);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className={cn(
								"text-muted-foreground hover:bg-muted hover:text-foreground relative size-8 cursor-pointer rounded-lg",
								className,
							)}
							aria-label={ariaLabel ?? t("theme_settings_aria")}
						>
							<Palette className="size-4" aria-hidden="true" />
							<span
								aria-hidden="true"
								className="border-background absolute right-1 bottom-1 size-2 rounded-full border shadow-xs"
								style={{ backgroundColor: activeThemeMeta.primaryColor }}
							/>
						</Button>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="text-xs">
					{t("theme_settings_tooltip", { theme: activeThemeName })}
				</TooltipContent>
			</Tooltip>

			<PopoverContent
				align="end"
				sideOffset={8}
				className="border-border/80 bg-background/95 w-80 rounded-xl p-4 shadow-xl backdrop-blur-md transition-all duration-200"
			>
				{open ? <ThemePickerPopoverContent title={title} footerSlot={footerSlot} /> : null}
			</PopoverContent>
		</Popover>
	);
}
