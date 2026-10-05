import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, en, formatMessage, getLocale, m, setLocale, zh } from "@/i18n";

describe("i18n Module & Dictionary Tests", () => {
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

  it("should properly format messages with parameter interpolation via formatMessage and m", () => {
    // Single parameter
    const single = formatMessage("toast.created", { name: "商品" });
    expect(single).toBe("商品 创建成功");
    expect(m.toast.created({ name: "商品" })).toBe("商品 创建成功");

    // Multiple parameters
    const multi = formatMessage("toast.status_changed", {
      subject: "订单",
      status: "已完成",
    });
    expect(multi).toBe("订单 状态已变更为 已完成");
    expect(m.toast.status_changed({ subject: "订单", status: "已完成" })).toBe(
      "订单 状态已变更为 已完成",
    );

    // Number parameters
    const tableSummary = m.table.pagination_summary({
      from: 1,
      to: 20,
      total: 100,
    });
    expect(tableSummary).toBe("第 1 至 20 条，共 100 条");
  });

  it("should fallback gracefully for missing keys", () => {
    // When key doesn't exist, replace underscore with space
    const unknown = formatMessage("non_existent_custom_key");
    expect(unknown).toBe("non existent custom key");

    const unknownNested = formatMessage("some.missing_nested_key");
    expect(unknownNested).toBe("missing nested key");
  });

  it("should switch language and reflect in formatMessage and Proxy m", () => {
    expect(getLocale()).toBe(DEFAULT_LOCALE);
    expect(m.menu.dashboard()).toBe("仪表盘");
    expect(formatMessage("menu.navigation")).toBe("导航");

    // Switch to English
    setLocale("en");
    expect(getLocale()).toBe("en");
    expect(m.menu.dashboard()).toBe("Dashboard");
    expect(formatMessage("menu.navigation")).toBe("Navigation");
    expect(m.toast.created({ name: "User" })).toBe("User created successfully");

    // Switch back to Chinese
    setLocale("zh");
    expect(getLocale()).toBe("zh");
    expect(m.menu.dashboard()).toBe("仪表盘");
  });

  it("should support new namespaces (notification, product, search)", () => {
    expect(m.notification.title()).toBe("通知");
    expect(m.product.status_active()).toBe("上架销售");
    expect(m.search.placeholder()).toBe("搜索系统功能或数据...");

    // In English
    setLocale("en");
    expect(m.notification.title()).toBe("Notifications");
    expect(m.product.status_active()).toBe("Active");
    expect(m.search.placeholder()).toBe("Search features or data...");
  });

  it("should fallback to DEFAULT_LOCALE when cookie is invalid", () => {
    document.cookie = "NEXT_LOCALE=invalid-lang; path=/;";
    expect(getLocale()).toBe(DEFAULT_LOCALE);
  });
});
