import type React from "react";

import type { BaseCellProps } from "../../base";
import type { UserOnlineStatus } from "./avatar-palette";

export type { UserOnlineStatus };

export interface AvatarItem {
  src?: string | null;
  name?: string;
  subtext?: string;
  fallback?: string;
  role?: string;
  status?: UserOnlineStatus;
}

export interface AvatarThumbProps {
  src?: string | null;
  name?: React.ReactNode;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg";
  shape?: "circle" | "rounded" | "square";
  /** 在线状态指示点 */
  status?: UserOnlineStatus;
  /** 显式提供用于哈希色彩的种子字符串，默认使用 name */
  colorSeed?: string;
  /** 是否开启根据姓名确定性生成多彩背景，默认 true */
  autoColor?: boolean;
  className?: string;
}

export interface AvatarCellProps extends BaseCellProps {
  /** 单头像图片链接 */
  src?: string | null;
  /** 辅助名称 / 主标题 */
  name?: React.ReactNode;
  /** 副文本（如邮箱、账号） */
  subtext?: React.ReactNode;
  /** 头像降级缩写字符 */
  fallback?: string;
  /** 头像形状 */
  shape?: "circle" | "rounded" | "square";
  /** 尺寸规格 */
  size?: "xs" | "sm" | "md" | "lg";
  /** 在线状态指示点（单头像模式） */
  status?: UserOnlineStatus;
  /** 确定性色彩种子 */
  colorSeed?: string;
  /** 是否开启根据名字自动哈希色彩，默认 true */
  autoColor?: boolean;
  /** 多头像组（群组/协作者展示） */
  stacked?: AvatarItem[];
  /** 多头像折叠最多展示数量，默认 3 */
  maxStacked?: number;
}
