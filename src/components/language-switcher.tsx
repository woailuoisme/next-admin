"use client";

import { Check, Languages } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setupZodLocale } from "@/lib/zod";
import { DEFAULT_LOCALE, getLocale, setLocale, type SupportedLocale } from "@/i18n";

const LOCALE_OPTIONS: { code: SupportedLocale; name: string; nativeName: string }[] = [
  { code: "zh", name: "Simplified Chinese", nativeName: "简体中文" },
  { code: "en", name: "English", nativeName: "English (US)" },
];

const emptySubscribe = () => () => {};

export function LanguageSwitcher() {
  const currentLocale = useSyncExternalStore(emptySubscribe, getLocale, () => DEFAULT_LOCALE);

  const handleLocaleChange = (locale: SupportedLocale) => {
    if (locale === currentLocale) return;
    setupZodLocale(locale);
    setLocale(locale, { reload: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground size-9"
          aria-label="Change language"
          title="Change language"
        >
          <Languages className="size-4" />
          <span className="sr-only">Switch Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-semibold">
          Select Language / 语言
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
}
