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

/**
 * 在 React 渲染之外按命名空间取文案（如 toast / 菜单 / 通知时间）。
 * 语言跟随 cookie，与 Provider 内部保持一致。
 */
export function createNamespaceTranslator<N extends keyof typeof zh>(namespace: N) {
  const locale = getUserLocale();
  return createTranslator({ locale, messages: DICTIONARY[locale], namespace });
}
