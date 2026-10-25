import { createTranslator } from "next-intl";

import en from "@/messages/en.json";
import zh from "@/messages/zh.json";

import { getUserLocale } from "./config";

export * from "./config";
export { getUserLocale as getLocale, setUserLocale as setLocale } from "./config";

export { zh, en };

export const DICTIONARY = {
  zh,
  en,
} as const;

type AppMessages = (typeof DICTIONARY)[keyof typeof DICTIONARY];

const translatorCache = new Map<string, unknown>();

/**
 * 在 React 渲染之外按命名空间取文案（如 toast / 菜单 / 通知时间）。
 * 语言跟随 cookie，与 Provider 内部保持一致。
 * 针对每个 (locale, namespace) 组合复用 Translator 实例，避免重复创建解析。
 */
export function createNamespaceTranslator<N extends keyof typeof zh>(namespace: N) {
  const locale = getUserLocale();
  const cacheKey = `${locale}:${namespace}`;
  const cached = translatorCache.get(cacheKey);
  if (cached) {
    return cached as ReturnType<typeof createTranslator<AppMessages, N>>;
  }
  const translator = createTranslator({ locale, messages: DICTIONARY[locale], namespace });
  translatorCache.set(cacheKey, translator);
  return translator;
}
