import { en } from "./en";
import { type MessageSchema, zh } from "./zh";

export { zh, en };
export type { MessageSchema };
export type MessageKey = keyof MessageSchema;

export const DICTIONARY: Record<"zh" | "en", MessageSchema> = {
  zh,
  en,
};
