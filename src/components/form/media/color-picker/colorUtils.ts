export const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR_REGEX.test(value.trim());
}

export function normalizeHexInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

export function toSixDigitHex(value: string, fallback = "#000000"): string {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{8}$/.test(trimmed)) {
    return trimmed.slice(0, 7).toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

/**
 * 计算调色盘网格方向键导航目标索引（默认每行 6 列）。
 */
export function getNextPaletteIndex(currentIndex: number, key: string, total: number, columns = 6): number {
  if (total <= 0) return -1;
  switch (key) {
    case "ArrowRight":
      return (currentIndex + 1) % total;
    case "ArrowLeft":
      return (currentIndex - 1 + total) % total;
    case "ArrowDown":
      return currentIndex + columns < total ? currentIndex + columns : currentIndex % columns;
    case "ArrowUp": {
      if (currentIndex - columns >= 0) return currentIndex - columns;
      const lastRowOffset = Math.floor((total - 1) / columns) * columns + (currentIndex % columns);
      return lastRowOffset < total ? lastRowOffset : Math.max(0, lastRowOffset - columns);
    }
    case "Home":
      return 0;
    case "End":
      return total - 1;
    default:
      return currentIndex;
  }
}
