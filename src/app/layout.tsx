import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { AppProviders } from "@/components/providers/AppProviders";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || "3500"}`),
  title: {
    default: "Admin Panel",
    template: "%s | Admin Panel",
  },
  description: "Enterprise admin dashboard built with Next.js and TanStack",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <html lang={locale} suppressHydrationWarning className={cn("h-full font-sans antialiased", inter.variable)}>
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
