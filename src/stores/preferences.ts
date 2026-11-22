import { create } from "zustand";

import {
  applyThemeDom,
  computeActiveThemeMeta,
  DEFAULT_RADIUS,
  getInitialColor,
  getInitialMode,
  getInitialRadius,
  RADIUS_OPTIONS,
  RADIUS_VALUES_SET,
  safeSetStorage,
  THEME_COLOR_STORAGE_KEY,
  THEME_CONFIG_MAP,
  THEME_CONFIGS,
  THEME_IDS_SET,
  THEME_MODE_STORAGE_KEY,
  THEME_RADIUS_STORAGE_KEY,
  type ThemeColor,
  type ThemeMeta,
  type ThemeMode,
} from "./themePresets";

export {
  RADIUS_OPTIONS,
  THEME_COLOR_STORAGE_KEY,
  THEME_CONFIG_MAP,
  THEME_CONFIGS,
  THEME_IDS_SET,
  THEME_MODE_STORAGE_KEY,
  THEME_RADIUS_STORAGE_KEY,
  type ThemeColor,
  type ThemeMeta,
  type ThemeMode,
};

export interface PreferencesState {
  theme: ThemeColor;
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  radius: string;
  themes: ThemeMeta[];
  activeThemeMeta: ThemeMeta;

  setTheme: (theme: ThemeColor) => void;
  setMode: (mode: ThemeMode) => void;
  setRadius: (radius: string) => void;
  initTheme: () => () => void;
}

export const usePreferencesStore = create<PreferencesState>()((set, get) => ({
  theme: "default",
  mode: "auto",
  resolvedMode: "light",
  radius: DEFAULT_RADIUS,
  themes: THEME_CONFIGS,
  activeThemeMeta: computeActiveThemeMeta("default"),

  setTheme: (newTheme: ThemeColor) => {
    const state = get();
    const meta = THEME_CONFIG_MAP.get(newTheme);
    const targetRadius =
      meta?.defaultRadius && RADIUS_VALUES_SET.has(meta.defaultRadius) ? meta.defaultRadius : state.radius;

    safeSetStorage(THEME_COLOR_STORAGE_KEY, newTheme);
    if (meta?.defaultRadius && RADIUS_VALUES_SET.has(meta.defaultRadius)) {
      safeSetStorage(THEME_RADIUS_STORAGE_KEY, meta.defaultRadius);
    }

    const resolved = applyThemeDom(newTheme, state.mode, targetRadius);
    set({
      theme: newTheme,
      radius: targetRadius,
      resolvedMode: resolved,
      activeThemeMeta: computeActiveThemeMeta(newTheme),
    });
  },

  setMode: (newMode: ThemeMode) => {
    const state = get();
    safeSetStorage(THEME_MODE_STORAGE_KEY, newMode);
    const resolved = applyThemeDom(state.theme, newMode, state.radius);
    set({ mode: newMode, resolvedMode: resolved });
  },

  setRadius: (newRadius: string) => {
    if (!RADIUS_VALUES_SET.has(newRadius)) return;
    const state = get();
    safeSetStorage(THEME_RADIUS_STORAGE_KEY, newRadius);
    applyThemeDom(state.theme, state.mode, newRadius);
    set({ radius: newRadius });
  },

  initTheme: () => {
    const hydratedColor = getInitialColor();
    const hydratedMode = getInitialMode();
    const hydratedRadius = getInitialRadius();
    const resolved = applyThemeDom(hydratedColor, hydratedMode, hydratedRadius);
    const current = get();
    if (
      hydratedColor !== current.theme ||
      hydratedMode !== current.mode ||
      hydratedRadius !== current.radius ||
      resolved !== current.resolvedMode
    ) {
      set({
        theme: hydratedColor,
        mode: hydratedMode,
        radius: hydratedRadius,
        resolvedMode: resolved,
        activeThemeMeta: computeActiveThemeMeta(hydratedColor),
      });
    }

    if (typeof window === "undefined" || !window.matchMedia) {
      return () => {};
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const state = get();
      if (state.mode === "auto") {
        set({ resolvedMode: applyThemeDom(state.theme, "auto", state.radius) });
      }
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === THEME_COLOR_STORAGE_KEY || e.key === THEME_MODE_STORAGE_KEY || e.key === THEME_RADIUS_STORAGE_KEY) {
        const nextColor = getInitialColor();
        const nextMode = getInitialMode();
        const nextRadius = getInitialRadius();
        set({
          theme: nextColor,
          mode: nextMode,
          radius: nextRadius,
          resolvedMode: applyThemeDom(nextColor, nextMode, nextRadius),
          activeThemeMeta: computeActiveThemeMeta(nextColor),
        });
      }
    };

    mediaQuery.addEventListener("change", handler);
    window.addEventListener("storage", storageHandler);

    return () => {
      mediaQuery.removeEventListener("change", handler);
      window.removeEventListener("storage", storageHandler);
    };
  },
}));

export const useTheme = () => usePreferencesStore((s) => s.theme);
export const useThemeMode = () => usePreferencesStore((s) => s.mode);
export const useResolvedThemeMode = () => usePreferencesStore((s) => s.resolvedMode);
export const useThemeRadius = () => usePreferencesStore((s) => s.radius);
export const useActiveThemeMeta = () => usePreferencesStore((s) => s.activeThemeMeta);
