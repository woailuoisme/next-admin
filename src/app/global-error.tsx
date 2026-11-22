"use client";

import { type AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { useEffect, useSyncExternalStore } from "react";

import { RootErrorComponent } from "@/components/layout/RootErrorComponent";
import { subscribeNoop } from "@/hooks/useIsHydrated";
import { DEFAULT_LOCALE, getUserLocale, type SupportedLocale } from "@/i18n/config";
import { layout as enLayout } from "@/messages/en.json";
import { layout as zhLayout } from "@/messages/zh.json";
import { usePreferencesStore } from "@/stores/preferences";
import "./globals.css";

const getServerLocaleSnapshot = (): SupportedLocale => DEFAULT_LOCALE;
const ERROR_MESSAGES: Record<SupportedLocale, AbstractIntlMessages> = {
	zh: { layout: zhLayout },
	en: { layout: enLayout },
};

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	const locale = useSyncExternalStore(subscribeNoop, getUserLocale, getServerLocaleSnapshot);

	useEffect(() => {
		const cleanup = usePreferencesStore.getState().initTheme();
		return cleanup;
	}, []);

	const messages = ERROR_MESSAGES[locale] ?? ERROR_MESSAGES.zh;

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
