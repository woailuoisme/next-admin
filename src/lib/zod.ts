import { locales, z } from "zod";

import { getLocale } from "@/i18n";

type ZodConfig = Parameters<typeof z.config>[0];

const ZOD_LOCALE_MAP: Record<string, () => ZodConfig> = {
  zh: locales.zhCN,
  en: locales.en,
};

/**
 * 根据语言代码同步配置 Zod 内置的多语言错误信息
 * 支持自动适配 i18n 的当前语言，无需在字段中手写任何错误 message
 */
export function setupZodLocale(locale?: string) {
  try {
    const current = locale ?? (typeof getLocale === "function" ? getLocale() : "zh");
    const localeFn = ZOD_LOCALE_MAP[current] ?? locales.zhCN;
    z.config(localeFn());
  } catch {
    z.config(locales.zhCN());
  }
}

// 全局自动初始化
setupZodLocale();

export { z };
