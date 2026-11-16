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

const TOASTER_ICONS = {
  success: <CircleCheckIcon className="text-chart-2 size-4" aria-hidden="true" />,
  info: <InfoIcon className="text-chart-1 size-4" aria-hidden="true" />,
  warning: <TriangleAlertIcon className="text-chart-3 size-4" aria-hidden="true" />,
  error: <OctagonXIcon className="text-destructive size-4" aria-hidden="true" />,
  loading: <Loader2Icon className="text-primary size-4 animate-spin" aria-hidden="true" />,
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
      .catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("[AppProviders] Failed to initialize MSW mocking:", error);
        }
      })
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
            {/* 始终渲染 children 以保留 SSR HTML 与 HydrationBoundary 水合；仅延迟挂载 guardSlot 等待 MSW 就绪 */}
            {isMockReady ? guardSlot : null}
            {children}
            <AppToaster />
          </TooltipProvider>
        </QueryClientProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
