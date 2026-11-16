/**
 * 确定性头像色彩调色板 (Deterministic Avatar Palette)
 * 基于 djb2 字符串哈希算法，将用户名稳定映射到 8 组高对比度、现代化无障碍兼容的背景/前景色彩
 */

export interface AvatarPaletteItem {
  bg: string;
  text: string;
  border?: string;
}

export const AVATAR_COLOR_PALETTES: AvatarPaletteItem[] = [
  {
    bg: "bg-primary/15",
    text: "text-primary",
    border: "border-primary/25",
  },
  {
    bg: "bg-chart-1/15",
    text: "text-chart-1",
    border: "border-chart-1/25",
  },
  {
    bg: "bg-chart-2/15",
    text: "text-chart-2",
    border: "border-chart-2/25",
  },
  {
    bg: "bg-chart-3/15",
    text: "text-chart-3",
    border: "border-chart-3/25",
  },
  {
    bg: "bg-chart-4/15",
    text: "text-chart-4",
    border: "border-chart-4/25",
  },
  {
    bg: "bg-chart-5/15",
    text: "text-chart-5",
    border: "border-chart-5/25",
  },
  {
    bg: "bg-secondary",
    text: "text-secondary-foreground",
    border: "border-border",
  },
  {
    bg: "bg-accent",
    text: "text-accent-foreground",
    border: "border-border",
  },
];

/**
 * djb2 字符哈希算法：快速、低碰撞、输出均匀
 */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * 根据用户名或种子获取确定性的头像配色
 */
export function getAvatarPalette(seed?: string | null): AvatarPaletteItem {
  if (!seed || seed.trim().length === 0) {
    return {
      bg: "bg-muted",
      text: "text-muted-foreground",
    };
  }
  const index = hashString(seed.trim()) % AVATAR_COLOR_PALETTES.length;
  return AVATAR_COLOR_PALETTES[index];
}

/**
 * 在线状态指示点样式映射
 */
export type UserOnlineStatus = "online" | "offline" | "busy" | "away";

export const STATUS_DOT_CLASSES: Record<UserOnlineStatus, string> = {
  online: "bg-chart-2",
  busy: "bg-destructive",
  away: "bg-chart-4",
  offline: "bg-muted-foreground/60",
};

export const STATUS_DOT_LABELS: Record<UserOnlineStatus, string> = {
  online: "在线",
  busy: "忙碌 / 请勿打扰",
  away: "离开",
  offline: "离线",
};
