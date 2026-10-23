import type React from "react";

import type { BaseCellProps } from "../base";
import type { UserOnlineStatus } from "../media/avatar/types";

// ==========================================
// 1. TextCell Props
// ==========================================
export interface TextCellProps extends BaseCellProps {
  /** 主标题文本 (亦可使用 value 传参) */
  title?: React.ReactNode;
  value?: React.ReactNode;
  /** 副标题 / 辅助说明文本（换行展示） */
  description?: React.ReactNode;
  /** 前缀图标或装饰 */
  prefix?: React.ReactNode;
  /** 后缀图标或装饰 */
  suffix?: React.ReactNode;
  /** 搜索关键词高亮文本（自动高亮匹配文本片段） */
  highlightText?: string;
  /** 元数据伴随徽标 (如 [INV-2024], "Beta") */
  tag?: React.ReactNode;
  /** 伴随徽标变体样式 */
  tagVariant?: "outline" | "secondary" | "primary" | "muted";
  /** 键盘快捷键提示 (如 "⌘K", "Ctrl+P") */
  kbd?: string;
  /** 超链接跳转地址 */
  url?: string;
  /** 是否在新标签打开（外链模式，默认显示外链图标） */
  isExternal?: boolean;
  /** 多行省略截断 (1 | 2 | 3 行) */
  lineClamp?: 1 | 2 | 3;
  /** 是否开启一键复制按钮 */
  copyable?: boolean | string;
  /** 是否等宽字体（如 SKU、订单号、哈希、金额等） */
  mono?: boolean;
  /** 限制最大字符长度或单行截断 */
  truncate?: boolean;
  /** 悬浮气泡提示文本（缺省为 title 内容） */
  tooltip?: React.ReactNode;
  /** 文字大小变体，默认 'sm' */
  size?: "xs" | "sm" | "base";
  /** 强调程度 */
  weight?: "normal" | "medium" | "semibold" | "bold";
  /** 点击事件回调 */
  onClick?: () => void;
}

// ==========================================
// 2. BadgeCell Props
// ==========================================
export type BadgeVariantType = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";

export interface BadgeCellOption {
  label: React.ReactNode;
  variant?: BadgeVariantType;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

export interface BadgeCellProps extends BaseCellProps {
  /** 徽章展示值（支持单值或数组，亦可通过 label 传参） */
  value?: any;
  label?: any;
  /** 最多展示标签数量，超出部分折叠为 +N 胶囊并提供悬浮提示 */
  maxCount?: number;
  /** 格式化标签函数或值映射字典 */
  labelMap?: Record<string, BadgeCellOption | React.ReactNode>;
  /** 变体样式映射（如 { PENDING: 'warning', PAID: 'success' }） */
  variantMap?: Record<string, BadgeVariantType>;
  /** 是否显示左侧状态圆点指示器 */
  dot?: boolean;
  /** 是否开启状态圆点呼吸灯动效 (Live pulse) */
  pulse?: boolean;
  /** 尺寸紧凑度，默认 'default' */
  density?: "default" | "compact";
  /** 徽章前缀图标 */
  icon?: React.ComponentType<{ className?: string }>;
  /** 基础变体样式 (亦可通过 color 传参) */
  variant?: BadgeVariantType;
  color?: BadgeVariantType;
  /** 悬停浮层提示 */
  tooltip?: React.ReactNode;
  /** 点击徽章交互/过滤回调，传入时徽章具备 hover 状态并支持点击 */
  onBadgeClick?: (value: any, event: React.MouseEvent) => void;
}

// ==========================================
// 3. IconCell Props
// ==========================================
export interface IconCellOption {
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  label?: React.ReactNode;
}

export interface IconCellProps extends BaseCellProps {
  /** 图标映射键值（可为 boolean 或 string 枚举） */
  value?: any;
  /** 预置图标组件 */
  icon?: React.ComponentType<{ className?: string }>;
  /** 枚举值与图标映射 */
  iconMap?: Record<string, IconCellOption | React.ComponentType<{ className?: string }>>;
  /** 颜色映射字典 */
  colorMap?: Record<string, string>;
  /** 图标尺寸 */
  size?: "sm" | "md" | "lg";
  /** 伴随文字标签 */
  label?: React.ReactNode;
  /** 标签排列方向，默认 'right' */
  labelPosition?: "right" | "bottom";
  /** 图标外框容器形态，默认 'none' */
  container?: "none" | "badge" | "circle";
  /** 提示文本 */
  tooltip?: React.ReactNode;
}

// ==========================================
// 4. DateCell Props
// ==========================================
export interface DateCellProps extends BaseCellProps {
  /** 日期对象、时间戳或 ISO 字符串 */
  value?: Date | string | number | null;
  /** 自定义 date-fns 格式化模版，默认 'yyyy-MM-dd HH:mm' */
  format?: string;
  /** 是否展示相对时间（如 “3 分钟前”）并在 Tooltip 显示精确时间 */
  relative?: boolean;
  /** 是否开启双行排版：免悬浮同屏展示相对时间与精确日期时间 */
  dualLine?: boolean;
  /** 双行模式下哪一行作为主标题，默认 'relative' */
  primaryFormat?: "relative" | "absolute";
  /** 是否展示悬浮气泡精确时间，默认 true */
  showTooltip?: boolean;
  /** 是否展示日历小图标 */
  showIcon?: boolean;
  /** 是否开启逾期预警提示（若日期早于当前时间则突出显示红色预警圆点） */
  overdueAlert?: boolean;
  /** SLA 临期或剩余倒计时提示 */
  countdown?: boolean;
  /** 倒计时前缀文案，如 "剩余 " */
  countdownPrefix?: string;
  /** 时区名称标注，如 'UTC', 'Asia/Shanghai' */
  timezone?: string;
}

// ==========================================
// 5. NumberCell Props
// ==========================================
export interface NumberCellProps extends BaseCellProps {
  /** 数值 */
  value?: number | null;
  /** 类型模式：常规数字、货币、百分比 */
  mode?: "number" | "currency" | "percent";
  /** 货币代码或符号，如 '$'、'¥'、'USD'，默认 '$' */
  currency?: string;
  /** ISO 国际标准币种代码 (如 'USD', 'CNY', 'EUR', 'JPY', 'GBP')，传入时通过 Intl.NumberFormat 原生本地化驱动 */
  currencyCode?: string;
  /** 小数点精度，默认 2 (别名 decimals) */
  precision?: number;
  decimals?: number;
  /** 本地化代码，如 'en-US' */
  locale?: string;
  /** 紧凑缩写格式化（如 1.5K, 2.3M） */
  compact?: boolean;
  /** 会计格式（负数用括号包裹，如 (12.50)） */
  accounting?: boolean;
  /** 前缀文本/符号 */
  prefix?: React.ReactNode;
  /** 后缀文本/单位 */
  suffix?: React.ReactNode;
  /** 涨跌趋势着色指示器（正数绿、负数红，别名 colorize） */
  trend?: boolean;
  colorize?: boolean;
  /** 环比 / 同比变动数值 (如 +12.4% 或 -5.2) */
  delta?: number | string;
  /** 变动方向，未提供时根据数值自动判定正负 */
  deltaType?: "increase" | "decrease" | "neutral" | "auto";
  /** 环比周期或对比说明 (如 "vs 上周", "vs 目标") */
  deltaDescription?: React.ReactNode;
  /** delta 前缀符 */
  deltaPrefix?: string;
}

// ==========================================
// 6. CurrencyCell Props
// ==========================================
export interface CurrencyCellProps extends Omit<NumberCellProps, "mode"> {}

// ==========================================
// 7. ProgressCell Props
// ==========================================
export interface ProgressSegment {
  /** 分段数值 */
  value: number;
  /** 分段色彩 (Tailwind 类名或十六进制或 CSS 变量) */
  color?: string;
  /** 分段标签名称 (如 "完成", "处理中") */
  label?: string;
  /** 自定义 class */
  className?: string;
}

export interface ProgressCellProps extends BaseCellProps {
  /** 进度值 (0-100) */
  value?: number | null;
  /** 最大值，默认 100 */
  max?: number;
  /** 是否在右侧显示百分比标签数字 (亦可使用 showPercentage / showValue) */
  showLabel?: boolean;
  showPercentage?: boolean;
  showValue?: boolean;
  /** 尺寸规格 */
  size?: "sm" | "md";
  /** 是否根据值变色（如高绿低红） */
  colorByValue?: boolean;
  /** 多段堆叠彩色进度切片（传入时自动转为堆叠模式） */
  segments?: ProgressSegment[];
  /** 目标刻度线指示 (0-100) */
  target?: number;
  /** 目标标尺悬浮或文字提示 */
  targetLabel?: string;
}

// ==========================================
// 8. ColorCell Props
// ==========================================
export interface ColorCellProps extends BaseCellProps {
  /** 颜色 Hex/RGB/RGBA 值，例如 #3b82f6 或 rgba(59, 130, 246, 0.5) (亦可通过 color 传参) */
  value?: string | null;
  color?: string | null;
  /** 是否可一键复制颜色代码 */
  copyable?: boolean;
  /** 是否在样本右侧显示 Hex 代码 */
  showHex?: boolean;
  /** 颜色块几何形状，默认 'rounded' */
  shape?: "circle" | "rounded" | "square";
  /** 是否启用半透明棋盘网格底纹，用于清晰呈现半透明颜色 */
  checkerboard?: boolean;
}

// ==========================================
// 9. UserCell Props (头像+姓名+副标题双行用户信息)
// ==========================================
export interface UserCellProps extends BaseCellProps {
  /** 姓名 / 主标题 */
  name?: React.ReactNode;
  /** 角色 / 邮箱 / 副说明信息 */
  subtitle?: React.ReactNode;
  /** 头像图片 URL */
  avatarSrc?: string;
  /** 头像图片 URL 别名 */
  avatarUrl?: string;
  /** 头像图片备用缩写（如 "JD"） */
  avatarFallback?: string;
  /** 备用缩写别名 */
  fallback?: string;
  /** 字段名称别名（通过属性名反射提取） */
  nameField?: string;
  subtitleField?: string;
  avatarField?: string;
  statusField?: string;
  verifiedField?: string;
  /** 形状：圆角或正圆 */
  shape?: "circle" | "rounded";
  /** 尺寸规格 */
  size?: "xs" | "sm" | "md" | "lg";
  /** 用户在线状态指示点 */
  status?: UserOnlineStatus;
  /** 是否开启根据姓名确定性生成多彩背景，默认 true */
  autoColor?: boolean;
  /** 是否展示官方认证徽标 (蓝勾) */
  verified?: boolean;
  /** 是否允许快捷点击复制副标题（如邮箱、ID） */
  copyableSubtitle?: boolean;
  /** 当用户信息为空或未指派时，是否渲染优雅的未指派占位状态，默认 true */
  allowUnassigned?: boolean;
  /** 未指派文案，默认 "未指派" */
  unassignedText?: string;
  /** 附加徽章或标签 */
  badge?: React.ReactNode;
  /** 点击用户行回调 */
  onClick?: () => void;
}

// ==========================================
// 10. RatingCell Props (星级评分)
// ==========================================
export interface RatingCellProps extends BaseCellProps {
  /** 评分数值 (如 4.5) */
  value: number;
  /** 最大星级数，默认 5 */
  max?: number;
  /** 是否允许半星 */
  allowHalf?: boolean;
  /** 是否在星标右侧展示数值 (如 "4.5") */
  showScore?: boolean;
  /** 评价总数或投票统计，如 128，展示为 (128) */
  reviewCount?: number | string;
  /** 分数显示小数位数 */
  precision?: number;
  /** 尺寸规格 */
  size?: "xs" | "sm" | "md";
  /** 图标类型：星星、爱心、火焰、大拇指 */
  iconType?: "star" | "heart" | "flame" | "thumb";
  /** 自定义活动星星色彩，默认 'text-amber-500 fill-amber-500' */
  activeColor?: string;
  /** 自定义色彩别名 */
  color?: string;
}

// ==========================================
// 11. SparklineCell Props (微走势折线/柱状图)
// ==========================================
export interface SparklineCellProps extends BaseCellProps {
  /** 趋势数据点数组 (如 [12, 18, 15, 26, 32, 28, 45]) */
  data: number[];
  /** 图表形态：折线面积图或微型柱状图，默认 'line' */
  variant?: "line" | "bar";
  /** 宽度，默认 96 */
  width?: number;
  /** 高度，默认 24 */
  height?: number;
  /** 线条粗细，默认 1.5 */
  strokeWidth?: number;
  /** 柱状图模式下的单柱宽度，默认 4 */
  barWidth?: number;
  /** 柱状图模式下的单柱间距，默认 2 */
  barGap?: number;
  /** 线条或柱子颜色，未提供时根据走势自动判定涨绿跌红或消费语义 Token */
  color?: string;
  /** 是否渲染半透明渐变面积填充，默认 true */
  showFill?: boolean;
  /** 填充渐变别名 */
  fillGradient?: boolean;
  /** 是否自动根据走势决定颜色 */
  autoTrendColor?: boolean;
  /** 是否在尾部绘制聚焦点小圆点，默认 true (亦可使用 showDot) */
  showEndpoint?: boolean;
  showDot?: boolean;
  /** 是否突出极值点 */
  showMinMax?: boolean;
  /** 是否开启鼠标悬浮动态十字游标与点位实时浮层交互 */
  interactive?: boolean;
  /** 鼠标悬浮气泡显示的文本 */
  tooltip?: React.ReactNode;
}

// ==========================================
// 12. MaskedCell Props (敏感数据脱敏与显隐)
// ==========================================
export type MaskType = "phone" | "email" | "apiKey" | "idCard" | "creditCard" | "jwt" | "custom";

export interface MaskedCellProps extends BaseCellProps {
  /** 原始敏感值 (如 "13800138000" 或 "sk-live_9487291847192") */
  value?: string | null;
  /** 掩码类型模式，默认 'custom' */
  maskType?: MaskType;
  /** 自定义遮罩格式化函数 (当 maskType='custom' 时生效) */
  customMask?: (val: string) => string;
  /** 是否允许点击眼睛图标切换明文，默认 true */
  allowReveal?: boolean;
  /** 点击查看明文后，多少秒后自动重新遮蔽（金融安全规范），例如 5 或 10，不传则不自动恢复 */
  autoHideDuration?: number;
  /** 是否允许一键复制原始值，默认 true */
  copyable?: boolean;
  /** copyable 别名 */
  allowCopy?: boolean;
  /** 掩码字符 */
  maskChar?: string;
  /** 是否等宽字体 */
  mono?: boolean;
}
