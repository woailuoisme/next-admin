import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, isSupportedLocale, LOCALE_COOKIE_NAME, type SupportedLocale } from "./config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale: SupportedLocale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
    // 开发期暴露缺键细节，生产期保持控制台安静
    onError(error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }
    },
    // 生产期缺键渲染为 namespace.key，便于定位而非渲染空白
    getMessageFallback({ namespace, key }) {
      return [namespace, key].filter(Boolean).join(".");
    },
  };
});
