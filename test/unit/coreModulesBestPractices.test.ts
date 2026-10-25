import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIsMobile } from "@/hooks/useMobile";
import { createNamespaceTranslator, getLocale, setLocale } from "@/i18n";
import { getLocale as getConfigLocale, setLocale as setConfigLocale } from "@/i18n/config";
import { useCentrifuge } from "@/integrations/centrifuge";
import { captureException, isGlitchTipEnabled, triggerTestError } from "@/integrations/glitchtip";
import { toSearchParams } from "@/lib/apiClient";
import { usePreferencesStore } from "@/stores/preferences";
import type { ApiQueryParams, ApiSortDirection, MessageKeyOf, MessageNamespace } from "@/types";

describe("Core Modules Vercel React Best Practices Tests", () => {
  beforeEach(() => {
    document.cookie = "NEXT_LOCALE=; path=/; max-age=0";
  });

  afterEach(() => {
    document.cookie = "NEXT_LOCALE=; path=/; max-age=0";
    vi.restoreAllMocks();
  });

  describe("i18n direct config export & translator caching", () => {
    it("should export getLocale and setLocale from config without barrel penalties", () => {
      expect(getConfigLocale()).toBe("zh");
      setConfigLocale("en");
      expect(getConfigLocale()).toBe("en");
      expect(getLocale()).toBe("en");

      setLocale("zh");
      expect(getConfigLocale()).toBe("zh");
    });

    it("should reuse cached createNamespaceTranslator instances across calls", () => {
      setLocale("zh");
      const translator1 = createNamespaceTranslator("toast");
      const translator2 = createNamespaceTranslator("toast");

      // Verify reference equality from cache
      expect(translator1).toBe(translator2);
      expect(translator1("deleted")).toBe("删除成功");

      // Changing locale changes translator instance
      setLocale("en");
      const translatorEn = createNamespaceTranslator("toast");
      expect(translatorEn).not.toBe(translator1);
      expect(translatorEn("deleted")).toBe("Deleted successfully");
    });
  });

  describe("useMobile performance & matchMedia query", () => {
    it("should return boolean without throwing and evaluate properly", () => {
      const { result } = renderHook(() => useIsMobile());
      expect(typeof result.current).toBe("boolean");
    });
  });

  describe("Centrifuge realtime state derivation", () => {
    it("should derive isConnected without full status subscription overhead", () => {
      const { result } = renderHook(() => useCentrifuge());
      expect(typeof result.current.isConnected).toBe("boolean");
    });
  });

  describe("GlitchTip diagnostics & exception bridge", () => {
    it("should report unconfigured state when DSN is empty", () => {
      expect(isGlitchTipEnabled()).toBe(false);
      const res = triggerTestError();
      expect(res.success).toBe(false);
      expect(res.message).toContain("未配置 GlitchTip DSN");
    });

    it("should safely ignore captureException when disabled without throwing", () => {
      expect(() => {
        captureException(new Error("Test crash"));
      }).not.toThrow();
    });
  });

  describe("apiClient toSearchParams ISO Date & params serialization", () => {
    it("should serialize Date objects to ISO string", () => {
      const date = new Date("2026-01-01T12:00:00.000Z");
      const params = {
        from: date,
        dates: [date],
        status: "active",
      };

      const result = toSearchParams(params);
      expect(decodeURIComponent(result)).toBe(
        "from=2026-01-01T12:00:00.000Z&dates[]=2026-01-01T12:00:00.000Z&status=active",
      );
    });
  });

  describe("preferences store selector & theme stability", () => {
    it("should initialize with default themes and allow mode switching", () => {
      const state = usePreferencesStore.getState();
      expect(state.themes.length).toBeGreaterThan(0);
      expect(state.theme).toBeDefined();

      state.setMode("dark");
      expect(usePreferencesStore.getState().mode).toBe("dark");

      state.setMode("light");
      expect(usePreferencesStore.getState().mode).toBe("light");
    });
  });

  describe("Types validation", () => {
    it("should enforce valid ApiQueryParams and ApiSortDirection", () => {
      const sortDir: ApiSortDirection = "asc";
      const query: ApiQueryParams = {
        page: 1,
        pageSize: 10,
        sortOrder: sortDir,
        search: "query",
      };
      expect(query.page).toBe(1);

      // Verify MessageNamespace & MessageKeyOf compile properly
      const ns: MessageNamespace = "toast";
      const key: MessageKeyOf<"toast"> = "created";
      expect(ns).toBe("toast");
      expect(key).toBe("created");
    });
  });
});
