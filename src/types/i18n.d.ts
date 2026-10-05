import type { SupportedLocale } from "@/i18n/config";
import type { MessageSchema } from "@/i18n/locales";

declare module "next-intl" {
  interface AppConfig {
    Messages: MessageSchema;
    Locale: SupportedLocale;
  }
}
