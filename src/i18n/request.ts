import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  LOCALE_COOKIE_NAME,
  type SupportedLocale,
} from "./config";
import { zh } from "./locales/zh";

function deepMerge<T extends Record<string, unknown>, S extends Record<string, unknown>>(
  target: T,
  fallback: S,
): T & S {
  const result: Record<string, unknown> = { ...fallback, ...target };
  for (const key of Object.keys(fallback)) {
    const fallbackVal = fallback[key];
    const targetVal = target[key];

    if (
      fallbackVal &&
      typeof fallbackVal === "object" &&
      !Array.isArray(fallbackVal) &&
      targetVal &&
      typeof targetVal === "object" &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        fallbackVal as Record<string, unknown>,
      );
    } else if (targetVal !== undefined) {
      result[key] = targetVal;
    } else {
      result[key] = fallbackVal;
    }
  }
  return result as T & S;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale: SupportedLocale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const currentMessages = (await import(`./locales/${locale}`))[locale];
  // Deep merge fallback: fallback to Chinese if English misses any key
  const messages =
    locale === DEFAULT_LOCALE
      ? currentMessages
      : deepMerge(currentMessages as Record<string, unknown>, zh as Record<string, unknown>);

  return {
    locale,
    messages,
  };
});
