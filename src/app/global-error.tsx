"use client";

import { NextIntlClientProvider } from "next-intl";
import { useEffect, useSyncExternalStore } from "react";

import { RootErrorComponent } from "@/components/layout/RootErrorComponent";
import { DEFAULT_LOCALE, DICTIONARY, getUserLocale, type SupportedLocale } from "@/i18n";
import { usePreferencesStore } from "@/stores/preferences";
import "./globals.css";

const subscribeNoop = () => () => {};
const getServerLocaleSnapshot = (): SupportedLocale => DEFAULT_LOCALE;

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale = useSyncExternalStore(subscribeNoop, getUserLocale, getServerLocaleSnapshot);

  useEffect(() => {
    const cleanup = usePreferencesStore.getState().initTheme();
    return cleanup;
  }, []);

  const messages = DICTIONARY[locale] ?? DICTIONARY.zh;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-background text-foreground flex min-h-screen items-center justify-center font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <RootErrorComponent error={error} reset={reset} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
