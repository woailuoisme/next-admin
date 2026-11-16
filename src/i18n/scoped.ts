import { createTranslator } from "next-intl";

import type zh from "@/messages/zh.json";

import { getUserLocale, type SupportedLocale } from "./config";

type AppMessages = typeof zh;
const scopedTranslatorCache = new Map<string, unknown>();

/**
 * 为非 React 上下文创建仅绑定单一命名空间字典的轻量级 Translator，
 * 避免通过 `@/i18n` barrel 静态引入全量双语字典导致客户端 Bundle 膨胀。
 */
export function createScopedTranslator<N extends keyof AppMessages>(
  namespace: N,
  dictionaries: Record<SupportedLocale, AppMessages[N]>,
) {
  return () => {
    const locale = getUserLocale();
    const cacheKey = `${locale}:${String(namespace)}`;
    const cached = scopedTranslatorCache.get(cacheKey);
    if (cached) {
      return cached as ReturnType<typeof createTranslator<AppMessages, N>>;
    }
    const translator = createTranslator({
      locale,
      messages: { [namespace]: dictionaries[locale] } as unknown as AppMessages,
      namespace,
    });
    scopedTranslatorCache.set(cacheKey, translator);
    return translator;
  };
}
