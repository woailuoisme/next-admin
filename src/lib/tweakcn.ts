/**
 * Tweakcn Theme Parser and Serializer
 * Handles parsing, validation, and serialization of Tweakcn CSS specifications.
 * Source specification: https://tweakcn.com/editor/theme
 */

import { isEmptyObject } from "es-toolkit";

export interface ShadcnThemeRegistryItem {
  $schema?: string;
  name: string;
  type: "registry:style" | string;
  cssVars?: {
    theme?: Record<string, string>;
    light?: Record<string, string>;
    dark?: Record<string, string>;
  };
}

export interface ParsedTheme {
  name?: string;
  lightVars: Record<string, string>;
  darkVars: Record<string, string>;
  radius?: string;
  primaryColor: string;
  accentColor: string;
  rawCss?: string;
}

/**
 * Extracts CSS variables from a CSS rule block (e.g., inside `{ ... }`)
 */
function extractVariablesFromBlock(blockText: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const match of blockText.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    vars[match[1].trim()] = match[2].trim();
  }
  return vars;
}

/**
 * Finds the content within matching braces for a given selector
 */
function extractBlockContent(cssText: string, selectorRegex: RegExp): string {
  const match = selectorRegex.exec(cssText);
  if (!match) return "";

  const startIndex = match.index + match[0].length;
  let depth = 1;
  let currentIndex = startIndex;

  while (currentIndex < cssText.length && depth > 0) {
    const char = cssText[currentIndex];
    if (char === "{") depth++;
    else if (char === "}") depth--;
    currentIndex++;
  }

  return cssText.slice(startIndex, currentIndex - 1);
}

/**
 * Parses user-pasted Tweakcn CSS code into structured light and dark mode CSS variables.
 */
export function parseTweakcnCss(cssText: string): ParsedTheme {
  const cleanCss = cssText.trim();
  if (!cleanCss) {
    throw new Error("CSS 内容不能为空");
  }

  // 1. Try to extract :root block
  let rootBlock = extractBlockContent(cleanCss, /:root\s*\{/);

  // 2. Try to extract .dark block
  const darkBlock = extractBlockContent(
    cleanCss,
    /(?:\.dark|\[data-theme=["'][^"']+["']\]\.dark|\.dark\[data-theme=["'][^"']+["']\])\s*\{/,
  );

  // If no standard :root or .dark was found, user might have pasted just a list of variables
  if (!rootBlock && !darkBlock) {
    const allVars = extractVariablesFromBlock(cleanCss);
    if (isEmptyObject(allVars)) {
      throw new Error("未检测到有效的 CSS 变量定义（需包含形如 --primary: ... 等定义）");
    }
    rootBlock = cleanCss;
  }

  const lightVars = extractVariablesFromBlock(rootBlock || cleanCss);
  const darkVars = extractVariablesFromBlock(darkBlock || "");

  // Fallback darkVars if none provided: copy lightVars
  if (isEmptyObject(darkVars)) {
    Object.assign(darkVars, lightVars);
  }

  // Extract primary and accent for swatch preview
  const primaryColor = lightVars["--primary"] || darkVars["--primary"] || "oklch(0.6171 0.1375 39.0427)";

  const accentColor =
    lightVars["--accent"] || lightVars["--chart-2"] || darkVars["--accent"] || "oklch(0.9245 0.0138 92.9892)";

  // Extract radius if specified
  const radius = lightVars["--radius"] || darkVars["--radius"];

  return {
    lightVars,
    darkVars,
    radius,
    primaryColor,
    accentColor,
    rawCss: cleanCss,
  };
}

function formatVars(vars: Record<string, string>, indent = "  "): string {
  return Object.entries(vars)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join("\n");
}

function normalizeVars(rawVars: Record<string, string> = {}): Record<string, string> {
  const res: Record<string, string> = {};
  for (const [key, val] of Object.entries(rawVars)) {
    const cssKey = key.startsWith("--") ? key : `--${key}`;
    res[cssKey] = val;
  }
  return res;
}

/**
 * Builds standard scoped CSS rules for injecting a custom Tweakcn theme into the DOM
 */
export function buildCustomThemeStyleSheet(parsed: ParsedTheme, selector = '[data-theme="custom"]'): string {
  const lightTokens = formatVars(parsed.lightVars, "  ");
  const darkTokens = formatVars(parsed.darkVars, "    ");

  return `:root${selector} {\n${lightTokens}\n\n  &.dark {\n${darkTokens}\n  }\n}`;
}

/**
 * Formats given theme tokens into standard Tweakcn CSS code export
 */
export function formatTweakcnExport(
  lightVars: Record<string, string>,
  darkVars: Record<string, string>,
  radius = "0.5rem",
): string {
  const lightMerged = { ...lightVars };
  if (radius) lightMerged["--radius"] = radius;

  const darkMerged = { ...darkVars };
  if (radius) darkMerged["--radius"] = radius;

  return `@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
${formatVars(lightMerged)}
}

.dark {
${formatVars(darkMerged)}
}
`;
}

/**
 * Parses official Shadcn / Tweakcn Registry item JSON (e.g. from https://tweakcn.com/r/themes/supabase.json)
 */
export function parseTweakcnRegistryJson(registryItem: ShadcnThemeRegistryItem): ParsedTheme {
  if (!registryItem.cssVars) {
    throw new Error("Invalid registry item: missing cssVars");
  }

  const lightVars = normalizeVars(registryItem.cssVars.light);
  const darkVars = normalizeVars(registryItem.cssVars.dark);

  if (isEmptyObject(darkVars)) {
    Object.assign(darkVars, lightVars);
  }

  const primaryColor = lightVars["--primary"] || darkVars["--primary"] || "oklch(0.6171 0.1375 39.0427)";

  const accentColor =
    lightVars["--accent"] || lightVars["--chart-2"] || darkVars["--accent"] || "oklch(0.9245 0.0138 92.9892)";

  const radius = lightVars["--radius"] || darkVars["--radius"] || registryItem.cssVars.theme?.radius;

  return {
    name: registryItem.name,
    lightVars,
    darkVars,
    radius,
    primaryColor,
    accentColor,
  };
}

/**
 * Universal parser: accepts raw CSS string, JSON string, or Registry Item Object
 */
export function parseTweakcnTheme(input: string | ShadcnThemeRegistryItem): ParsedTheme {
  if (typeof input === "object" && input !== null) {
    return parseTweakcnRegistryJson(input);
  }

  const trimmed = input.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsedJson = JSON.parse(trimmed) as ShadcnThemeRegistryItem;
      if (parsedJson.cssVars) {
        return parseTweakcnRegistryJson(parsedJson);
      }
    } catch {
      // Fallback to CSS parsing if JSON.parse fails
    }
  }

  return parseTweakcnCss(trimmed);
}
