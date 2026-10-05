"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";

import { ThemeInitializer } from "@/components/layout/theme-initializer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { env } from "@/env";
import { getQueryClient } from "@/lib/query-client";

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

export function AppProviders({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  const [isMockReady, setIsMockReady] = useState(() => !env.NEXT_PUBLIC_ENABLE_MOCK);

  useEffect(() => {
    if (env.NEXT_PUBLIC_ENABLE_MOCK) {
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
              children
            ) : (
              <div className="flex h-screen w-full items-center justify-center">
                <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
              </div>
            )}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </QueryClientProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
