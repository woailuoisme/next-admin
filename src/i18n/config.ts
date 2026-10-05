/**
 * next-intl internationalization configuration
 */

export const SUPPORTED_LOCALES = ["zh", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "zh";
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export function isSupportedLocale(locale: unknown): locale is SupportedLocale {
  return typeof locale === "string" && SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function getUserLocale(): SupportedLocale {
  if (typeof document === "undefined") {
    return DEFAULT_LOCALE;
  }
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE_NAME}=([^;]+)`));
  if (match && isSupportedLocale(match[1])) {
    return match[1];
  }
  return DEFAULT_LOCALE;
}

export function setUserLocale(locale: SupportedLocale): void {
  if (typeof document !== "undefined") {
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }
}
