"use client";

import { useLocale, useTranslations } from "next-intl";

import { useMemoizedFn } from "ahooks";
import { Check, Languages } from "lucide-react";
import { memo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setUserLocale, type SupportedLocale } from "@/i18n";
import { setupZodLocale } from "@/lib/zod";

export interface LanguageSwitcherProps {
  className?: string;
  value?: SupportedLocale;
  onLocaleChange?: (locale: SupportedLocale) => void;

  ariaLabel?: string;
  title?: string;
  menuLabel?: string;
}

const LOCALE_OPTIONS = [
  { code: "zh", name: "Simplified Chinese", nativeName: "简体中文" },
  { code: "en", name: "English", nativeName: "English (US)" },
] as const satisfies readonly { code: SupportedLocale; name: string; nativeName: string }[];

export const LanguageSwitcher = memo(function LanguageSwitcher({
  className,
  value,
  onLocaleChange,
  ariaLabel,
  title,
  menuLabel,
}: LanguageSwitcherProps) {
  const t = useTranslations("shared");
  const ctxLocale = useLocale();
  const currentLocale = (value ?? ctxLocale) as SupportedLocale;
  const router = useRouter();

  const handleLocaleChange = useMemoizedFn((newLocale: SupportedLocale) => {
    if (newLocale === currentLocale) return;
    if (onLocaleChange) {
      onLocaleChange(newLocale);
      return;
    }
    setUserLocale(newLocale);
    setupZodLocale(newLocale);
    router.refresh();
  });

  const effectiveAriaLabel = ariaLabel ?? t("lang_switch_aria");
  const effectiveTitle = title ?? t("lang_switch_title");
  const effectiveMenuLabel = menuLabel ?? t("lang_switch_label");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("text-muted-foreground hover:text-foreground size-9", className)}
          aria-label={effectiveAriaLabel}
          title={effectiveTitle}
        >
          <Languages className="size-4" />
          <span className="sr-only">{effectiveAriaLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-semibold">
          {effectiveMenuLabel}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LOCALE_OPTIONS.map((option) => {
          const isSelected = currentLocale === option.code;
          return (
            <DropdownMenuItem
              key={option.code}
              onClick={() => handleLocaleChange(option.code)}
              className="flex cursor-pointer items-center justify-between py-1.5 text-xs"
            >
              <div className="flex flex-col">
                <span className="text-foreground font-medium">{option.nativeName}</span>
                <span className="text-muted-foreground text-[10px]">{option.name}</span>
              </div>
              {isSelected && <Check className="text-primary ml-2 size-4 shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
