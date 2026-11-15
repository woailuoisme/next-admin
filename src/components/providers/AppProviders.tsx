"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, useEffect, useState } from "react";

import { ThemeInitializer } from "@/components/layout/ThemeInitializer";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { env } from "@/env";
import { getQueryClient } from "@/lib/queryClient";
import { useResolvedThemeMode } from "@/stores/preferences";

let isConsoleErrorPatched = false;

// Filter out React 19 false-positive warning for next-themes inline script tag in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development" && !isConsoleErrorPatched) {
  isConsoleErrorPatched = true;
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    originalError.apply(console, args);
  };
}

const TOASTER_ICONS = {
  success: <CircleCheckIcon className="text-chart-2 size-4" />,
  info: <InfoIcon className="text-chart-1 size-4" />,
  warning: <TriangleAlertIcon className="text-chart-3 size-4" />,
  error: <OctagonXIcon className="text-destructive size-4" />,
  loading: <Loader2Icon className="text-primary size-4 animate-spin" />,
};

/** 仅订阅解析后主题状态的叶子节点，避免主题切换触发整个 AppProviders 子树重渲染 */
function AppToaster() {
  const resolvedTheme = useResolvedThemeMode();
  return <Toaster position="top-right" closeButton visibleToasts={4} icons={TOASTER_ICONS} theme={resolvedTheme} />;
}

export interface AppProvidersProps {
  children: ReactNode;
  /** 业务鉴权与会话守卫插槽（例如 AuthAppBridge / SessionValidator） */
  guardSlot?: ReactNode;
}

export function AppProviders({ children, guardSlot }: AppProvidersProps) {
  const queryClient = getQueryClient();

  const [isMockReady, setIsMockReady] = useState(() => !env.ENABLE_MOCK);

  useEffect(() => {
    if (!env.ENABLE_MOCK) return;
    let cancelled = false;

    void import("@/mocks/init")
      .then(({ enableMocking }) => enableMocking())
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setIsMockReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ThemeInitializer />
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider delayDuration={0}>
            {isMockReady ? (
              <>
                {guardSlot}
                {children}
              </>
            ) : (
              <div
                role="status"
                aria-label="Loading application"
                className="flex h-screen w-full items-center justify-center"
              >
                <Loader2Icon className="text-primary size-7 animate-spin" aria-hidden="true" />
                <span className="sr-only">Loading application...</span>
              </div>
            )}
            <AppToaster />
          </TooltipProvider>
        </QueryClientProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
