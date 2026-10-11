import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactElement, type ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * 创建适用于测试隔离的 QueryClient
 * 禁用请求重试，避免失败测试因重试导致的超时和抖动
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

import { NextIntlClientProvider } from "next-intl";
import { DICTIONARY, type SupportedLocale } from "@/i18n";

export interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
  locale?: SupportedLocale;
}

/**
 * 全局 Provider 包裹层，与生产环境 AppProviders 保持一致
 */
export function renderWithProviders(
  ui: ReactElement,
  { queryClient = createTestQueryClient(), locale = "zh", ...renderOptions }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider
        locale={locale}
        messages={DICTIONARY[locale as keyof typeof DICTIONARY] ?? DICTIONARY.zh}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <NuqsAdapter>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
            </QueryClientProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </NextIntlClientProvider>
    );
  }

  return {
    user: userEvent.setup(),
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// 重新导出 RTL 核心方法与 userEvent
export * from "@testing-library/react";
export { userEvent };
