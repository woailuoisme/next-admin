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
  // 1. Blue (科技蓝)
  {
    bg: "bg-blue-100 dark:bg-blue-950/70",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800/60",
  },
  // 2. Emerald (自然翡翠绿)
  {
    bg: "bg-emerald-100 dark:bg-emerald-950/70",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/60",
  },
  // 3. Violet (神秘紫罗兰)
  {
    bg: "bg-violet-100 dark:bg-violet-950/70",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800/60",
  },
  // 4. Amber (暖阳琥珀)
  {
    bg: "bg-amber-100 dark:bg-amber-950/70",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/60",
  },
  // 5. Rose (活力玫瑰粉)
  {
    bg: "bg-rose-100 dark:bg-rose-950/70",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800/60",
  },
  // 6. Cyan (清爽青蓝)
  {
    bg: "bg-cyan-100 dark:bg-cyan-950/70",
    text: "text-cyan-800 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800/60",
  },
  // 7. Indigo (深邃靛青)
  {
    bg: "bg-indigo-100 dark:bg-indigo-950/70",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800/60",
  },
  // 8. Orange (热烈橙色)
  {
    bg: "bg-orange-100 dark:bg-orange-950/70",
    text: "text-orange-800 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800/60",
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
  online: "bg-emerald-500",
  busy: "bg-rose-500",
  away: "bg-amber-500",
  offline: "bg-slate-400 dark:bg-slate-500",
};

export const STATUS_DOT_LABELS: Record<UserOnlineStatus, string> = {
  online: "在线",
  busy: "忙碌 / 请勿打扰",
  away: "离开",
  offline: "离线",
};
