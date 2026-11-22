import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import "@/lib/serverAuthHeaders";
import { AppProviders } from "@/components/providers/AppProviders";
import { env } from "@/env";
import { AuthAppBridge, SessionValidator } from "@/features/auth";
import { cn } from "cn";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
	fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

export const metadata: Metadata = {
	metadataBase: new URL(env.APP_URL || `http://localhost:${process.env.PORT || "3000"}`),
	title: {
		default: "Admin Panel",
		template: "%s | Admin Panel",
	},
	description: "Enterprise admin dashboard built with Next.js and TanStack",
};

const THEME_PREHYDRATE_SCRIPT = `(function(){try{var root=document.documentElement;var themes=["default","supabase","catppuccin","caffeine","twitter","vercel"];var radii=["0","0.35rem","0.45rem","0.5rem","0.625rem"];var color=localStorage.getItem("app-theme-color");if(color&&themes.indexOf(color)!==-1){root.setAttribute("data-theme",color);}var mode=localStorage.getItem("theme");if(mode==="system"){mode="auto";}var effective=(mode==="light"||mode==="dark")?mode:(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");root.classList.remove("light","dark");root.classList.add(effective);root.style.colorScheme=effective;var radius=localStorage.getItem("app-theme-radius");if(radius&&radii.indexOf(radius)!==-1){root.style.setProperty("--radius",radius);}}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

	return (
		<html lang={locale} suppressHydrationWarning className={cn("h-full font-sans antialiased", inter.variable)}>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_PREHYDRATE_SCRIPT }} />
			</head>
			<body className="flex min-h-full flex-col font-sans">
				<NextIntlClientProvider locale={locale} messages={messages}>
					<AppProviders guardSlot={<SessionValidator />}>
						<AuthAppBridge>{children}</AuthAppBridge>
					</AppProviders>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
