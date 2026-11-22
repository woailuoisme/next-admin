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
export const DEFAULT_RADIUS = "0.45rem";
export const RADIUS_VALUES_SET = new Set(RADIUS_OPTIONS.map((opt) => opt.value));

export function safeGetStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage access errors in restricted/private browser contexts
  }
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyThemeDom(color: ThemeColor, currentMode: ThemeMode, currentRadius: string): "light" | "dark" {
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

export function getInitialColor(): ThemeColor {
  const stored = safeGetStorage(THEME_COLOR_STORAGE_KEY);
  return stored && THEME_IDS_SET.has(stored) ? (stored as ThemeColor) : "default";
}

export function getInitialMode(): ThemeMode {
  const stored = safeGetStorage(THEME_MODE_STORAGE_KEY);
  if (stored === "system") return "auto";
  return stored === "light" || stored === "dark" || stored === "auto" ? stored : "auto";
}

export function getInitialRadius(): string {
  const stored = safeGetStorage(THEME_RADIUS_STORAGE_KEY);
  return stored && RADIUS_VALUES_SET.has(stored) ? stored : DEFAULT_RADIUS;
}

export function computeActiveThemeMeta(theme: ThemeColor): ThemeMeta {
  return THEME_CONFIG_MAP.get(theme) ?? THEME_CONFIGS[0];
}
