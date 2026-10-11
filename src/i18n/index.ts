import en from "@/messages/en.json";
import zh from "@/messages/zh.json";

export * from "./config";
export { getUserLocale as getLocale, setUserLocale as setLocale } from "./config";

export { zh, en };
export type MessageSchema = typeof zh;
export type MessageKey = keyof MessageSchema;

export const DICTIONARY = {
  zh,
  en,
} as const;
