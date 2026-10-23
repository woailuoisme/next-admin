"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, useEffect, useState } from "react";
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";

import { ThemeInitializer } from "@/components/layout/ThemeInitializer";
import { SessionValidator } from "@/features/auth/components/SessionValidator";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { env } from "@/env";
import { getQueryClient } from "@/lib/queryClient";

// Filter out React 19 false-positive warning for next-themes inline script tag in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    originalError.apply(console, args);
  };
}

const TOASTER_ICONS = {
  success: <CircleCheckIcon className="size-4 text-emerald-500" />,
  info: <InfoIcon className="size-4 text-sky-500" />,
  warning: <TriangleAlertIcon className="size-4 text-amber-500" />,
  error: <OctagonXIcon className="text-destructive size-4" />,
  loading: <Loader2Icon className="text-primary size-4 animate-spin" />,
};

export function AppProviders({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  const [isMockReady, setIsMockReady] = useState(() => !env.ENABLE_MOCK);

  useEffect(() => {
    if (env.ENABLE_MOCK) {
      void import("@/mocks/init").then(({ enableMocking }) => {
        void enableMocking().then(() => {
          setIsMockReady(true);
        });
      });
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ThemeInitializer />
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider delayDuration={0}>
            {isMockReady ? (
              <>
                <SessionValidator />
                {children}
              </>
            ) : (
              <div className="flex h-screen w-full items-center justify-center">
                <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
              </div>
            )}
            <Toaster position="top-right" closeButton visibleToasts={4} icons={TOASTER_ICONS} />
          </TooltipProvider>
        </QueryClientProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
