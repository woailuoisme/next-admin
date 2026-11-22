let cachedCanvasCtx: CanvasRenderingContext2D | null = null;
const colorCache = new Map<string, string>();

function getColorNormalizerCtx(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!cachedCanvasCtx) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    cachedCanvasCtx = canvas.getContext("2d", { willReadFrequently: true });
  }
  return cachedCanvasCtx;
}

export function clearColorNormalizationCache(): void {
  colorCache.clear();
}

/**
 * 将任意浏览器支持的 CSS 颜色（含 oklch / color-mix / hsl）通过 Canvas 2D
 * 实时归一化为 MapLibre Style Spec 可识别的 #rrggbb / rgba(...) 格式。
 */
export function resolveCssColorToHex(cssColor: string, fallback: string): string {
  const trimmed = cssColor.trim();
  if (!trimmed) return fallback;

  const hit = colorCache.get(trimmed);
  if (hit) return hit;

  const ctx = getColorNormalizerCtx();
  if (!ctx) return fallback;

  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillStyle = trimmed;
  const serialized = ctx.fillStyle;

  let resolved = fallback;
  if (typeof serialized === "string" && /^#[0-9a-f]{6}$/i.test(serialized)) {
    resolved = serialized;
  } else {
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    if (a > 0) {
      resolved =
        a === 255
          ? `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
          : `rgba(${r}, ${g}, ${b}, ${Number((a / 255).toFixed(2))})`;
    }
  }

  colorCache.set(trimmed, resolved);
  return resolved;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!match) return null;
  return [Number.parseInt(match[1], 16), Number.parseInt(match[2], 16), Number.parseInt(match[3], 16)];
}

function mixHex(aHex: string, bHex: string, ratioB: number): string {
  const a = hexToRgb(aHex);
  const b = hexToRgb(bHex);
  if (!a || !b) return bHex;
  const mix = (x: number, y: number) => Math.round(x + (y - x) * ratioB);
  const r = mix(a[0], b[0]);
  const g = mix(a[1], b[1]);
  const bl = mix(a[2], b[2]);
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
}

export function buildRampFromBase(
  baseHex: string,
  backgroundHex: string,
  mutedHex: string,
  foregroundHex: string,
  isDark: boolean,
): readonly string[] {
  const anchor = isDark ? mixHex(backgroundHex, foregroundHex, 0.1) : mixHex(backgroundHex, mutedHex, 0.65);
  return [
    mixHex(anchor, baseHex, 0.2),
    mixHex(anchor, baseHex, 0.4),
    mixHex(anchor, baseHex, 0.62),
    mixHex(anchor, baseHex, 0.82),
    baseHex,
  ];
}
