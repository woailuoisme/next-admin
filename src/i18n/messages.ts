import { DICTIONARY, type MessageSchema } from "./locales";
import { getLocale } from "./runtime";

export * from "./locales";

export function formatMessage(keyPath: string, args?: Record<string, unknown>): string {
  const locale = getLocale();
  const dict = DICTIONARY[locale as keyof typeof DICTIONARY] ?? DICTIONARY.zh;
  const zhDict = DICTIONARY.zh;

  let text: string | undefined;

  if (keyPath.includes(".")) {
    const parts = keyPath.split(".");
    let curr: unknown = dict;
    let zhCurr: unknown = zhDict;
    for (const part of parts) {
      curr = (curr as Record<string, unknown> | undefined)?.[part];
      zhCurr = (zhCurr as Record<string, unknown> | undefined)?.[part];
    }
    if (typeof curr === "string") {
      text = curr;
    } else if (typeof zhCurr === "string") {
      text = zhCurr;
    }
  } else {
    // Check direct match or namespace matching fallback
    const curr = (dict as Record<string, unknown>)[keyPath];
    const zhCurr = (zhDict as Record<string, unknown>)[keyPath];
    if (typeof curr === "string") {
      text = curr;
    } else if (typeof zhCurr === "string") {
      text = zhCurr;
    } else if (keyPath.includes("_")) {
      const idx = keyPath.indexOf("_");
      const ns = keyPath.slice(0, idx);
      const k = keyPath.slice(idx + 1);
      const nsVal =
        (dict as Record<string, Record<string, string>>)?.[ns]?.[k] ??
        (zhDict as Record<string, Record<string, string>>)?.[ns]?.[k];
      if (typeof nsVal === "string") {
        text = nsVal;
      }
    }
  }

  if (text === undefined) {
    const lastPart = keyPath.split(".").pop() ?? keyPath;
    text = lastPart.replace(/_/g, " ");
  }

  if (args) {
    for (const [k, v] of Object.entries(args)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }

  return text;
}

export type NestedMessageAccessor<T> = {
  [K in keyof T]: T[K] extends Record<string, string>
    ? { [P in keyof T[K]]: (args?: Record<string, unknown>) => string }
    : (args?: Record<string, unknown>) => string;
};

function createNestedProxy(prefix = ""): any {
  return new Proxy(() => {}, {
    get(_target, prop: string | symbol) {
      if (typeof prop === "symbol") {
        if (prop === Symbol.toPrimitive) {
          return () => prefix;
        }
        if (prop === Symbol.toStringTag) {
          return "MessageAccessor";
        }
        return undefined;
      }
      if (prop === "then" || prop === "toJSON" || prop === "$$typeof") {
        return undefined;
      }
      const path = prefix ? `${prefix}.${prop}` : prop;
      return createNestedProxy(path);
    },
    apply(_target, _thisArg, argArray) {
      const args = argArray[0] as Record<string, unknown> | undefined;
      return formatMessage(prefix, args);
    },
  });
}

export const m: NestedMessageAccessor<MessageSchema> = createNestedProxy();
