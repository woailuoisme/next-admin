import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import zh from "@/messages/zh.json";

type MessageTree = { [key: string]: string | MessageTree };

/** 把嵌套消息扁平化为点路径键集 */
function flattenKeys(tree: MessageTree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? [path] : flattenKeys(value, path);
  });
}

/**
 * 类型增强只保证 zh 的键完整（Messages: typeof zh），
 * 这里补齐 en 的缺口：两边键集必须完全一致，值允许不同。
 */
describe("message key parity", () => {
  it("keeps en and zh message files structurally identical", () => {
    const zhKeys = flattenKeys(zh as MessageTree).sort();
    const enKeys = flattenKeys(en as MessageTree).sort();

    const missingInEn = zhKeys.filter((key) => !enKeys.includes(key));
    const missingInZh = enKeys.filter((key) => !zhKeys.includes(key));

    expect(missingInEn, `messages/en.json 缺少：${missingInEn.join(", ")}`).toEqual([]);
    expect(missingInZh, `messages/zh.json 缺少：${missingInZh.join(", ")}`).toEqual([]);
  });

  it("never ships an empty message value", () => {
    const empties = [...flattenValues(en, "en"), ...flattenValues(zh, "zh")].filter(([, value]) => !value.trim());
    expect(empties).toEqual([]);
  });

  it("contains required stats telemetry and trend localization keys in both locales", () => {
    const requiredStatsKeys = [
      "status_stale",
      "retry",
      "no_data",
      "loading",
      "trend_up",
      "trend_down",
      "trend_neutral",
      "just_now",
      "last_updated",
    ] as const;

    for (const key of requiredStatsKeys) {
      expect(en.stats[key].trim().length).toBeGreaterThan(0);
      expect(zh.stats[key].trim().length).toBeGreaterThan(0);
    }
  });
});

function flattenValues(tree: MessageTree, locale: string, prefix = ""): Array<[string, string]> {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string"
      ? [[`${locale}:${path}`, value] as [string, string]]
      : flattenValues(value, locale, path);
  });
}
