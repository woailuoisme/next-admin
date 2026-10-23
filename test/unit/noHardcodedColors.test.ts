import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const SRC_ROOT = path.resolve(import.meta.dirname, "../../src");

/**
 * AGENTS.md 红线：业务代码严禁硬编码色值。
 * 仅扫描 .tsx 中的 Tailwind 任意值颜色工具类（bg-[#fff] / shadow-[...rgba(...)] 等）；
 * 调色板常量（map/heatmap/colorRamps.ts、stores/preferences.ts 等 .ts 数据文件）不受影响。
 */
const ARBITRARY_COLOR_CLASS =
  /(?:^|[\s"'`{])(?:bg|text|border|ring|shadow|outline|fill|stroke|from|via|to|divide|accent|caret|decoration|placeholder)-\[[^\]]*(?:#|rgba?\(|hsla?\()/;

/** ui/ 目录由 shadcn CLI 维护，严禁手改，也不纳入本门禁 */
const EXCLUDED_DIRS = [path.join(SRC_ROOT, "components", "ui")];

function collectFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return EXCLUDED_DIRS.some((excluded) => fullPath === excluded || fullPath.startsWith(`${excluded}${path.sep}`))
        ? []
        : collectFiles(fullPath);
    }
    return entry.name.endsWith(".tsx") ? [fullPath] : [];
  });
}

describe("Design token enforcement", () => {
  it("does not use arbitrary color values in Tailwind class names", () => {
    const offenders = collectFiles(SRC_ROOT).flatMap((file) => {
      const relative = path.relative(SRC_ROOT, file);
      return readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, index) =>
          ARBITRARY_COLOR_CLASS.test(line) ? [`${relative}:${index + 1} → ${line.trim()}`] : [],
        );
    });

    expect(offenders, `Hardcoded colors must use theme tokens in globals.css:\n${offenders.join("\n")}`).toEqual([]);
  });
});
