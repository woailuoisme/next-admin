import { create } from "zustand";

export type ThemeColor = "default" | "supabase" | "catppuccin" | "caffeine" | "twitter" | "vercel";

export type ThemeMode = "light" | "dark" | "auto";

export interface ThemeMeta {
  id: ThemeColor;
  name: string;
  nameEn: string;
  primaryColor: string;
  accentColor: string;
  description: string;
  defaultRadius?: string;
}

export const THEME_CONFIGS: ThemeMeta[] = [
  {
    id: "default",
    name: "Default",
    nameEn: "Default",
    primaryColor: "#f59e0b",
    accentColor: "#d97706",
    description: "default",
    defaultRadius: "0.45rem",
  },
  {
    id: "supabase",
    name: "Supabase",
    nameEn: "Supabase",
    primaryColor: "#3ecf8e",
    accentColor: "#24b47e",
    description: "Supabase ",
    defaultRadius: "0.5rem",
  },
  {
    id: "catppuccin",
    name: "Catppuccin",
    nameEn: "Catppuccin",
    primaryColor: "#8b5cf6",
    accentColor: "#06b6d4",
    description: "Catppuccin",
    defaultRadius: "0.35rem",
  },
  {
    id: "caffeine",
    name: "Caffeine",
    nameEn: "Caffeine",
    primaryColor: "#78350f",
    accentColor: "#b45309",
    description: "Caffeine",
    defaultRadius: "0.5rem",
  },
  {
    id: "twitter",
    name: "Twitter",
    nameEn: "Twitter",
    primaryColor: "#1d9bf0",
    accentColor: "#0c7abf",
    description: "Twitter",
    defaultRadius: "1.3rem",
  },
  {
    id: "vercel",
    name: "Vercel",
    nameEn: "Vercel",
    primaryColor: "#000000",
    accentColor: "#666666",
    description: "纯粹黑白高对比度与前沿极简工程美学",
    defaultRadius: "0.5rem",
  },
];

export const THEME_CONFIG_MAP = new Map<ThemeColor, ThemeMeta>(THEME_CONFIGS.map((t) => [t.id, t]));
export const THEME_IDS_SET = new Set<string>(THEME_CONFIGS.map((t) => t.id));

export const RADIUS_OPTIONS = [
  { label: "直角 (0)", value: "0" },
  { label: "精细 (0.35)", value: "0.35rem" },
  { label: "默认 (0.45)", value: "0.45rem" },
  { label: "适中 (0.5)", value: "0.5rem" },
  { label: "饱满 (0.625)", value: "0.625rem" },
];

export const THEME_COLOR_STORAGE_KEY = "app-theme-color";
export const THEME_MODE_STORAGE_KEY = "theme";
export const THEME_RADIUS_STORAGE_KEY = "app-theme-radius";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeDom(color: ThemeColor, currentMode: ThemeMode, currentRadius: string): "light" | "dark" {
  const effectiveMode = currentMode === "auto" ? getSystemTheme() : currentMode;

  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.setAttribute("data-theme", color);
    root.classList.remove("light", "dark");
    root.classList.add(effectiveMode);
    root.style.colorScheme = effectiveMode;
    if (currentRadius) {
      root.style.setProperty("--radius", currentRadius);
    }
  }

  return effectiveMode;
}

function getInitialColor(): ThemeColor {
  if (typeof window === "undefined") return "default";
  const stored = window.localStorage.getItem(THEME_COLOR_STORAGE_KEY);
  if (stored && THEME_IDS_SET.has(stored)) {
    return stored as ThemeColor;
  }
  return "default";
}

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "auto";
  const stored = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "auto") {
    return stored;
  }
  return "auto";
}

function getInitialRadius(): string {
  if (typeof window === "undefined") return "0.45rem";
  const stored = window.localStorage.getItem(THEME_RADIUS_STORAGE_KEY);
  return stored ?? "0.45rem";
}

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

function computeActiveThemeMeta(theme: ThemeColor): ThemeMeta {
  return THEME_CONFIG_MAP.get(theme) ?? THEME_CONFIGS[0];
}

const initialColor = getInitialColor();
const initialMode = getInitialMode();
const initialRadius = getInitialRadius();
const initialResolvedMode = initialMode === "auto" ? getSystemTheme() : initialMode;

export const usePreferencesStore = create<PreferencesState>()((set, get) => ({
  theme: initialColor,
  mode: initialMode,
  resolvedMode: initialResolvedMode,
  radius: initialRadius,
  themes: THEME_CONFIGS,
  activeThemeMeta: computeActiveThemeMeta(initialColor),

  setTheme: (newTheme: ThemeColor) => {
    const state = get();
    const meta = THEME_CONFIG_MAP.get(newTheme);
    const targetRadius = meta?.defaultRadius ?? state.radius;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_COLOR_STORAGE_KEY, newTheme);
      if (meta?.defaultRadius) {
        window.localStorage.setItem(THEME_RADIUS_STORAGE_KEY, meta.defaultRadius);
      }
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
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_MODE_STORAGE_KEY, newMode);
    }

    const resolved = applyThemeDom(state.theme, newMode, state.radius);
    set({ mode: newMode, resolvedMode: resolved });
  },

  setRadius: (newRadius: string) => {
    const state = get();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_RADIUS_STORAGE_KEY, newRadius);
    }

    applyThemeDom(state.theme, state.mode, newRadius);
    set({ radius: newRadius });
  },

  initTheme: () => {
    const state = get();
    const resolved = applyThemeDom(state.theme, state.mode, state.radius);
    if (resolved !== state.resolvedMode) {
      set({ resolvedMode: resolved });
    }

    if (typeof window === "undefined" || !window.matchMedia) {
      return () => {};
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const current = get();
      if (current.mode === "auto") {
        const nextResolved = applyThemeDom(current.theme, "auto", current.radius);
        set({ resolvedMode: nextResolved });
      }
    };

    // 跨标签页（Multi-tab）原生主题偏好变更同步监听
    const storageHandler = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === THEME_COLOR_STORAGE_KEY || e.key === THEME_MODE_STORAGE_KEY || e.key === THEME_RADIUS_STORAGE_KEY) {
        const nextColor = getInitialColor();
        const nextMode = getInitialMode();
        const nextRadius = getInitialRadius();

        const nextResolved = applyThemeDom(nextColor, nextMode, nextRadius);
        set({
          theme: nextColor,
          mode: nextMode,
          radius: nextRadius,
          resolvedMode: nextResolved,
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
