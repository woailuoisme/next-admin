import { createTranslator } from "next-intl";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_LOCALE,
  DICTIONARY,
  en,
  getUserLocale,
  isSupportedLocale,
  setUserLocale,
  SUPPORTED_LOCALES,
  zh,
} from "@/i18n";

describe("next-intl i18n Architecture Tests", () => {
  beforeEach(() => {
    // Reset cookie before each test
    document.cookie = "NEXT_LOCALE=; path=/; max-age=0";
  });

  afterEach(() => {
    document.cookie = "NEXT_LOCALE=; path=/; max-age=0";
  });

  it("should have exact 1:1 namespace and key parity between zh and en dictionaries", () => {
    const zhNamespaces = Object.keys(zh).sort();
    const enNamespaces = Object.keys(en).sort();

    expect(zhNamespaces).toEqual(enNamespaces);
    expect(zhNamespaces.length).toBeGreaterThan(0);

    // Verify all namespaces have exact matching keys and non-empty strings
    for (const ns of zhNamespaces as (keyof typeof zh)[]) {
      const zhSubKeys = Object.keys(zh[ns]).sort();
      const enSubKeys = Object.keys(en[ns]).sort();

      expect(zhSubKeys).toEqual(enSubKeys);

      for (const k of zhSubKeys) {
        const zhVal = (zh[ns] as Record<string, string>)[k];
        const enVal = (en[ns] as Record<string, string>)[k];
        expect(zhVal).toBeTruthy();
        expect(enVal).toBeTruthy();
      }
    }
  });

  it("should validate supported locales and fallback rules", () => {
    expect(DEFAULT_LOCALE).toBe("zh");
    expect(SUPPORTED_LOCALES).toEqual(["zh", "en"]);
    expect(isSupportedLocale("zh")).toBe(true);
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("fr")).toBe(false);
  });

  it("should manage user locale in cookie with getUserLocale and setUserLocale", () => {
    expect(getUserLocale()).toBe(DEFAULT_LOCALE);

    setUserLocale("en");
    expect(getUserLocale()).toBe("en");

    setUserLocale("zh");
    expect(getUserLocale()).toBe("zh");
  });

  it("should fallback to DEFAULT_LOCALE when cookie is invalid", () => {
    document.cookie = "NEXT_LOCALE=invalid-lang; path=/;";
    expect(getUserLocale()).toBe(DEFAULT_LOCALE);
  });

  it("should format messages correctly via createTranslator with ICU parameters", () => {
    const tZhToast = createTranslator({
      locale: "zh",
      messages: DICTIONARY.zh,
      namespace: "toast",
    });

    expect(tZhToast("created", { name: "商品" })).toBe("商品 创建成功");
    expect(
      tZhToast("status_changed", {
        subject: "订单",
        status: "已完成",
      }),
    ).toBe("订单 状态已变更为 已完成");

    const tEnToast = createTranslator({
      locale: "en",
      messages: DICTIONARY.en,
      namespace: "toast",
    });

    expect(tEnToast("created", { name: "Product" })).toBe("Product created successfully");

    const tZhTable = createTranslator({
      locale: "zh",
      messages: DICTIONARY.zh,
      namespace: "table",
    });

    expect(
      tZhTable("pagination_summary", {
        from: 1,
        to: 20,
        total: 100,
      }),
    ).toBe("第 1 至 20 条，共 100 条");

    const tEnTable = createTranslator({
      locale: "en",
      messages: DICTIONARY.en,
      namespace: "table",
    });

    expect(
      tEnTable("pagination_summary", {
        from: 1,
        to: 20,
        total: 100,
      }),
    ).toBe("Showing 1 to 20 of 100 entries");
  });

  it("should translate menu, notification, product, and search namespaces in both languages", () => {
    const tZhMenu = createTranslator({
      locale: "zh",
      messages: DICTIONARY.zh,
      namespace: "menu",
    });
    const tEnMenu = createTranslator({
      locale: "en",
      messages: DICTIONARY.en,
      namespace: "menu",
    });

    expect(tZhMenu("dashboard")).toBe("仪表盘");
    expect(tEnMenu("dashboard")).toBe("Dashboard");

    const tZhNotif = createTranslator({
      locale: "zh",
      messages: DICTIONARY.zh,
      namespace: "notification",
    });
    const tEnNotif = createTranslator({
      locale: "en",
      messages: DICTIONARY.en,
      namespace: "notification",
    });

    expect(tZhNotif("title")).toBe("通知");
    expect(tEnNotif("title")).toBe("Notifications");
    expect(tZhNotif("unread_count", { count: 5 })).toBe("5 条未读");
    expect(tEnNotif("unread_count", { count: 5 })).toBe("5 unread");

    const tZhProduct = createTranslator({
      locale: "zh",
      messages: DICTIONARY.zh,
      namespace: "products",
    });
    const tEnProduct = createTranslator({
      locale: "en",
      messages: DICTIONARY.en,
      namespace: "products",
    });

    expect(tZhProduct("status_active")).toBe("上架销售");
    expect(tEnProduct("status_active")).toBe("Active");

    const tZhSearch = createTranslator({
      locale: "zh",
      messages: DICTIONARY.zh,
      namespace: "search",
    });
    const tEnSearch = createTranslator({
      locale: "en",
      messages: DICTIONARY.en,
      namespace: "search",
    });

    expect(tZhSearch("placeholder")).toBe("搜索系统功能或数据...");
    expect(tEnSearch("placeholder")).toBe("Search features or data...");
  });
});
