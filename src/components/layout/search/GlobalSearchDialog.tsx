import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemoizedFn } from "ahooks";
import { Moon, PanelLeft, Sun } from "lucide-react";
import { memo, useMemo } from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { useSidebar } from "@/components/ui/sidebar";
import { usePreferencesStore } from "@/stores/preferences";

import type { GlobalSearchDialogProps } from "./types";

import { getFlatNavItems, useSidebarMenuGroups } from "../sidebar/menu.config";

export const GlobalSearchDialog = memo(function GlobalSearchDialog({
  open,
  onOpenChange,
  placeholder,
  emptyText,
}: GlobalSearchDialogProps) {
  const t = useTranslations("layout");
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const setMode = usePreferencesStore((s) => s.setMode);

  const menuGroups = useSidebarMenuGroups();
  const navItems = useMemo(() => getFlatNavItems(menuGroups), [menuGroups]);

  const handleNavigate = useMemoizedFn((to: string) => {
    onOpenChange(false);
    router.push(to);
  });

  const handlePreload = useMemoizedFn((to: string) => {
    try {
      router.prefetch(to);
    } catch {
      // ignore preload failure for unmatched or dynamic routes
    }
  });

  const handleToggleSidebar = useMemoizedFn(() => {
    onOpenChange(false);
    toggleSidebar();
  });

  const handleSetLight = useMemoizedFn(() => {
    onOpenChange(false);
    setMode("light");
  });

  const handleSetDark = useMemoizedFn(() => {
    onOpenChange(false);
    setMode("dark");
  });

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className="border-border/80 bg-popover/95 top-[12%] max-w-[calc(100%-2rem)] overflow-hidden rounded-2xl! border p-0 shadow-2xl backdrop-blur-md sm:top-[15%] sm:max-w-lg md:max-w-xl lg:max-w-2xl"
    >
      <Command className="rounded-2xl border-0 bg-transparent">
        <CommandInput placeholder={placeholder ?? t("search_placeholder")} className="h-12 text-sm" />
        <CommandList className="max-h-[min(340px,50vh)] overflow-y-auto px-1 py-1 sm:max-h-[min(440px,65vh)]">
          <CommandEmpty className="text-muted-foreground py-8 text-center text-sm">
            {emptyText ?? t("search_empty")}
          </CommandEmpty>

          <CommandGroup heading={t("search_group_pages")}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.to}
                  onSelect={() => handleNavigate(item.to)}
                  onMouseEnter={() => handlePreload(item.to)}
                  onFocus={() => handlePreload(item.to)}
                  className="group flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden">
                    {Icon && (
                      <Icon className="text-muted-foreground group-aria-selected:text-foreground size-4 shrink-0 transition-colors" />
                    )}
                    <div className="flex min-w-0 items-center gap-1.5 truncate">
                      {item.parentTitle && (
                        <>
                          <span className="text-muted-foreground/70 shrink-0 text-xs font-normal">
                            {item.parentTitle}
                          </span>
                          <span className="text-muted-foreground/40 shrink-0 text-xs select-none">/</span>
                        </>
                      )}
                      <span className="text-foreground truncate font-medium">{item.title}</span>
                    </div>
                  </div>
                  <span
                    data-slot="command-shortcut"
                    className="text-muted-foreground/40 group-aria-selected:text-muted-foreground/80 ml-auto hidden shrink-0 font-mono text-[11px] sm:inline"
                  >
                    {item.to}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator className="my-1" />

          <CommandGroup heading={t("search_group_actions")}>
            <CommandItem
              onSelect={handleToggleSidebar}
              className="group flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
            >
              <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
                <PanelLeft className="text-muted-foreground group-aria-selected:text-foreground size-4 shrink-0 transition-colors" />
                <span className="truncate">{t("search_toggle_sidebar")}</span>
              </div>
              <CommandShortcut className="text-[10px]">⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={handleSetLight}
              className="group flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
            >
              <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
                <Sun className="text-muted-foreground group-aria-selected:text-foreground size-4 shrink-0 transition-colors" />
                <span className="truncate">{t("search_theme_light")}</span>
              </div>
            </CommandItem>
            <CommandItem
              onSelect={handleSetDark}
              className="group flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
            >
              <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
                <Moon className="text-muted-foreground group-aria-selected:text-foreground size-4 shrink-0 transition-colors" />
                <span className="truncate">{t("search_theme_dark")}</span>
              </div>
            </CommandItem>
          </CommandGroup>
        </CommandList>

        {/* Desktop keyboard shortcut pro footer bar - hidden on mobile */}
        <div className="border-border/50 bg-muted/20 text-muted-foreground/80 hidden items-center justify-between border-t px-3.5 py-2 text-[11px] select-none sm:flex">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Kbd className="border-border/70 bg-background h-4 border px-1 text-[10px] font-medium">↑</Kbd>
              <Kbd className="border-border/70 bg-background h-4 border px-1 text-[10px] font-medium">↓</Kbd>
              <span>{t("search_navigate")}</span>
            </span>
            <span className="flex items-center gap-1">
              <Kbd className="border-border/70 bg-background h-4 border px-1 text-[10px] font-medium">↵</Kbd>
              <span>{t("search_select")}</span>
            </span>
            <span className="flex items-center gap-1">
              <Kbd className="border-border/70 bg-background h-4 border px-1 text-[10px] font-medium">esc</Kbd>
              <span>{t("search_close")}</span>
            </span>
          </div>
          <div className="text-muted-foreground/60 flex items-center gap-1 text-[10px]">
            <span>TanStack Dashboard</span>
          </div>
        </div>
      </Command>
    </CommandDialog>
  );
});
