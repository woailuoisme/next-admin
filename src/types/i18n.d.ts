import type { SupportedLocale } from "@/i18n/config";
import type zh from "@/messages/zh.json";

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof zh;
    Locale: SupportedLocale;
  }
}
