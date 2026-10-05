/**
 * Next.js Internationalization (i18n) Runtime
 * Cookie-based locale management without URL prefix
 */

export type SupportedLocale = "zh" | "en";

export const DEFAULT_LOCALE: SupportedLocale = "zh";

export function getLocale(): SupportedLocale {
  if (typeof document === "undefined") {
    return DEFAULT_LOCALE;
  }
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  if (match && (match[1] === "zh" || match[1] === "en")) {
    return match[1] as SupportedLocale;
  }
  return DEFAULT_LOCALE;
}

export function setLocale(locale: SupportedLocale, options?: { reload?: boolean }): void {
  if (typeof document !== "undefined") {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    if (options?.reload) {
      window.location.reload();
    }
  }
}
